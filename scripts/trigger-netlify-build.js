#!/usr/bin/env node
'use strict';

const https = require('https');
const { URL } = require('url');

const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL || process.argv[2];
const triggerMessage = process.env.NETLIFY_BUILD_MESSAGE || process.argv[3] || 'Triggered via trigger-netlify-build.js';

if (!hookUrl) {
  console.error('Missing build hook URL. Pass it as NETLIFY_BUILD_HOOK_URL env var or first argument.');
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(hookUrl);
} catch (error) {
  console.error('Invalid NETLIFY_BUILD_HOOK_URL provided.');
  process.exit(1);
}

const payload = JSON.stringify({
  trigger_branch: process.env.NETLIFY_BUILD_BRANCH || 'main',
  trigger_title: triggerMessage,
});

const options = {
  method: 'POST',
  hostname: parsedUrl.hostname,
  path: `${parsedUrl.pathname}${parsedUrl.search}`,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const request = https.request(options, (response) => {
  const chunks = [];

  response.on('data', (chunk) => chunks.push(chunk));
  response.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
      console.log('Netlify build hook triggered successfully.');
      if (body) {
        console.log(body);
      }
    } else {
      console.error(`Netlify hook responded with status ${response.statusCode}`);
      if (body) {
        console.error(body);
      }
      process.exit(1);
    }
  });
});

request.on('error', (error) => {
  console.error('Failed to trigger Netlify build hook.');
  console.error(error);
  process.exit(1);
});

request.write(payload);
request.end();
