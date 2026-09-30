import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { promises as fsp } from 'fs';
import { promisify } from 'util';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, ENV } from '../config/env.js';
const unlinkAsync = promisify(fs.unlink);

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

  // Remove local file after success
  unlinkAsync(localFilePath).catch(()=>{});

  if (ENV.NODE_ENV === 'development') {
      console.log('[Cloudinary] upload success', response.public_id);
    }

    return response;
  } catch (error) {
  if (ENV.NODE_ENV !== "production") {
      console.error("[Cloudinary] upload error:", error?.message || error);
    }

    // Cleanup if upload failed
    try {
      if (localFilePath && await fsp.stat(localFilePath).then(()=>true).catch(()=>false)) {
        await unlinkAsync(localFilePath).catch(()=>{});
      }
    } catch (_) {}

    return null;
  }
};

export { uploadOnCloudinary };
