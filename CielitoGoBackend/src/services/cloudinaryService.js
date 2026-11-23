const { v2: cloudinary } = require('cloudinary');
const config = require('../config');

if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

const uploadImage = (buffer, folder) => {
  if (!config.cloudinary.enabled) {
    throw new Error('Cloudinary no está configurado');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `${config.cloudinary.folder}/${folder}`,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error('Cloudinary devolvió una respuesta incompleta'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  if (!config.cloudinary.enabled || !publicId) return;
  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
};

module.exports = { uploadImage, deleteImage };
