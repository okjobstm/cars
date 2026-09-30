import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { promises as fsp } from 'fs';
import { promisify } from 'util';
import { Readable } from 'stream';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, ENV } from '../config/env.js';
const unlinkAsync = promisify(fs.unlink);

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadStream = (buffer, options) => new Promise((resolve, reject) => {
  const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) return reject(error);
    resolve(result);
  });
  Readable.from(buffer).pipe(upload);
});

// `file` = chemin local (dev) ou Buffer (multer memoryStorage)
const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;

    const options = { resource_type: "image" };
    const response = Buffer.isBuffer(file)
      ? await uploadStream(file, options)
      : await cloudinary.uploader.upload(file, options);

    // Remove local file after success (uniquement si on ecrit encore sur disque)
    if (typeof file === 'string') unlinkAsync(file).catch(() => {});

    if (ENV.NODE_ENV === 'development') {
      console.log('[Cloudinary] upload success', response.public_id);
    }

    return response;
  } catch (error) {
    if (ENV.NODE_ENV !== "production") {
      console.error("[Cloudinary] upload error:", error?.message || error);
    }

    // Cleanup if upload failed
    if (typeof file === 'string') {
      try {
        if (file && await fsp.stat(file).then(() => true).catch(() => false)) {
          await unlinkAsync(file).catch(() => {});
        }
      } catch (_) { }
    }

    return null;
  }
};

export { uploadOnCloudinary };
