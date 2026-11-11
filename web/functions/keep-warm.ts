/**
 * Scheduled every 5 minutes (see netlify.toml). Calls the API health check so a
 * function instance and its database connection stay warm. Without it, the
 * first visitor after a quiet period can wait 20+ seconds for the database to
 * answer, long enough for actions like email verification to time out.
 */
export const handler = async () => {
  const site = process.env.URL || process.env.SITE_URL;
  if (!site) return { statusCode: 200, body: 'No site URL configured' };

  const started = Date.now();
  try {
    const response = await fetch(new URL('/api/health', site), { signal: AbortSignal.timeout(25_000) });
    console.log(JSON.stringify({ message: 'keep-warm ping', status: response.status, ms: Date.now() - started }));
  } catch (error) {
    console.warn(JSON.stringify({
      message: 'keep-warm ping failed',
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - started,
    }));
  }
  return { statusCode: 200, body: 'ok' };
};
