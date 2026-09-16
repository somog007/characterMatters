import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import PlaybackSession from '../models/PlaybackSession';
import DeviceSession from '../models/DeviceSession';
import WatermarkConfig from '../models/WatermarkConfig';
import Video from '../models/Video';

export const createPlaybackSession = async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const user = req.user!;
    const deviceId = (req.headers['x-device-id'] as string) || 'default-web-device';
    const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // 1. Enforce Concurrent Device Limits
    const maxDevices = user.maxAllowedDevices || 2;
    const activeDeviceSessions = await DeviceSession.find({ 
      user: user._id, 
      isBlocked: false,
      lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Active within 15 mins
    });

    const isCurrentDeviceActive = activeDeviceSessions.some((d) => d.deviceId === deviceId);

    if (!isCurrentDeviceActive && activeDeviceSessions.length >= maxDevices) {
      return res.status(429).json({
        message: `Device limit exceeded. Maximum ${maxDevices} active device(s) allowed per account. Please log out from another device.`
      });
    }

    // Register or update active device
    await DeviceSession.findOneAndUpdate(
      { user: user._id, deviceId },
      { deviceName: userAgent.substring(0, 50), ipAddress, lastActive: new Date(), isBlocked: false },
      { upsert: true, new: true }
    );

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // 2. Generate Cryptographic Playback Session Token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 Hours valid session

    const playbackSession = await PlaybackSession.create({
      user: user._id,
      video: video._id,
      sessionToken: rawToken,
      ipAddress,
      userAgent,
      deviceId,
      status: 'active',
      expiresAt
    });

    // 3. Generate Signed HLS Manifest URL
    const hlsPath = video.hlsManifestPath || video.videoURL;
    const signingSecret = process.env.CDN_SIGNING_SECRET || 'char-matters-cdn-secret-key-2026';
    const tokenExp = Math.floor(Date.now() / 1000) + 120; // 2 minute manifest loading window

    const signature = crypto
      .createHmac('sha256', signingSecret)
      .update(`${hlsPath}:${rawToken}:${tokenExp}:${ipAddress}`)
      .digest('hex');

    const signedManifestUrl = `${hlsPath}?token=${signature}&sid=${rawToken}&exp=${tokenExp}`;

    // 4. Fetch Watermark Configuration
    let wmConfig = await WatermarkConfig.findOne();
    if (!wmConfig) {
      wmConfig = await WatermarkConfig.create({
        logoUrl: '/assets/watermark-logo.png',
        websiteDomain: 'CharacterMatters.com'
      });
    }

    return res.status(200).json({
      sessionToken: rawToken,
      manifestUrl: signedManifestUrl,
      watermark: {
        logoUrl: wmConfig.logoUrl,
        domain: wmConfig.websiteDomain,
        userIdentifier: user.email,
        sessionHash: rawToken.substring(0, 8),
        opacity: wmConfig.opacity,
        fontSize: wmConfig.fontSize,
        intervalSeconds: wmConfig.movementIntervalSeconds
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Failed to create playback session', error });
  }
};
