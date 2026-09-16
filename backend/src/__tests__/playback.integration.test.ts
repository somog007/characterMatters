import request from 'supertest';
import app from '../app';

describe('Video Playback Security & Access Control API', () => {
  it('should return 401 Unauthorized when requesting playback session without token', async () => {
    const res = await request(app).post('/api/videos/fakevideoid123/playback-session');
    expect(res.status).toBe(401);
  });

  it('should return 401 Unauthorized when requesting HLS key without token', async () => {
    const res = await request(app).get('/api/videos/hls-key');
    expect(res.status).toBe(401);
  });
});
