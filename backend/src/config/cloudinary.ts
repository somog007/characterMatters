// Cloudinary Media Delivery & Storage Configuration
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || '',
  api_key: env.CLOUDINARY_API_KEY || '',
  api_secret: env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export const uploadVideoToCloudinary = async (
  filePathOrBuffer: string,
  folder: string = 'character_matters/lessons'
) => {
  return cloudinary.uploader.upload(filePathOrBuffer, {
    resource_type: 'video',
    folder,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

export const uploadWorksheetPdfToCloudinary = async (
  filePath: string,
  folder: string = 'character_matters/worksheets'
) => {
  return cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder,
  });
};

export default cloudinary;
