const cloudinary = require("../config/cloudinary");
const uploadFile = async (filePath, folder = "event-portal") => {
  return cloudinary.uploader.upload(filePath, { folder });
};
module.exports = uploadFile;
