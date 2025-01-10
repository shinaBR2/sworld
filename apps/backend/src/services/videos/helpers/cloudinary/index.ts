import { v2 as cloudinary } from "cloudinary";
import { envConifg } from "src/utils/envConfig";

const uploadFromLocalFilePath = async (localFilePath: string, options = {}) => {
  cloudinary.config({
    cloud_name: envConifg.cloudinaryName,
    api_key: envConifg.cloudinaryApiKey,
    api_secret: envConifg.cloudinaryApiSecret,
  });

  const uploadResult = await cloudinary.uploader
    .upload(localFilePath, {
      ...options,
    })
    .catch((error) => {
      console.log(error);
    });

  console.log(uploadResult);

  if (uploadResult) {
    return uploadResult.url;
  }

  return "";
};

export { uploadFromLocalFilePath };
