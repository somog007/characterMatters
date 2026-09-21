// Cloudinary Media Delivery & Storage Configuration
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'character-matters',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
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
