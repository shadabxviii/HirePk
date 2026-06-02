import { v2 as cloudinary } from "cloudinary";

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    !cloudName || 
    cloudName === "your_cloud_name" || 
    !apiKey || 
    apiKey === "your_cloudinary_api_key" || 
    !apiSecret
  ) {
    console.warn("⚠️ Cloudinary credentials are not configured. Falling back to local server file storage.");
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
};

export default configureCloudinary;
export { cloudinary };
