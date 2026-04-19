import { apiError } from "../utils/apiError.js";
import { parseMultipartForm } from "../utils/multipart.js";
import { storeBuffer } from "../utils/storage.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const MIME_RULES = {
  poster: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  certificate: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  generic: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"],
};

export const uploadFile = async (req, res, next) => {
  try {
    const { fields, files } = await parseMultipartForm(req, { maxBytes: MAX_UPLOAD_SIZE });
    const file = files.find((entry) => entry.name === "file") || files[0];

    if (!file) {
      throw new apiError(400, "file is required");
    }

    const kind = (fields.kind || "generic").toLowerCase();
    const allowedMimeTypes = MIME_RULES[kind] || MIME_RULES.generic;

    if (!allowedMimeTypes.includes(file.contentType)) {
      throw new apiError(400, `Unsupported file type for ${kind} uploads`);
    }

    const folder = kind === "certificate" ? "uploads/certificates" : "uploads/posters";
    const stored = await storeBuffer({
      buffer: file.data,
      originalName: file.filename,
      mimeType: file.contentType,
      folder,
      req,
    });

    res.status(201).json({
      url: stored.url,
      publicId: stored.publicId,
      filename: stored.filename,
      mimeType: stored.mimeType,
      size: stored.size,
      storage: stored.storage,
    });
  } catch (err) {
    next(err);
  }
};

export default { uploadFile };
