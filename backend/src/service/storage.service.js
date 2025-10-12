const ImageKit = require("imagekit");
const dotenv = require("dotenv");

dotenv.config();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});
const uploadImage = async (file, fileName) => {
  try {
    const result = await imagekit.upload({
      file,
      fileName,
      folder : "/ai-captioner"
    });

    return result; 
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};

module.exports = { imagekit, uploadImage };
