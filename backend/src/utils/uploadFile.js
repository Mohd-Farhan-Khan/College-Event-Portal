import cloudinary from "../config/cloudinary.js";
const uploadFile = async (filePath, folder = "event-portal") => {
  return cloudinary.uploader.upload(filePath, { folder });
};
export default uploadFile;
