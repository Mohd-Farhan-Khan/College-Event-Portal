import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

const sanitizeFileName = (fileName = "file") => {
  const ext = path.extname(fileName).slice(0, 12);
  const baseName = path.basename(fileName, ext)
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "file";
  return `${baseName}${ext.toLowerCase()}`;
};

const buildPublicUrl = (req, pathname) => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${req.protocol}://${req.get("host")}${normalizedPath}`;
};

export const isCloudinaryConfigured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET,
);

export const storeBuffer = async ({
  buffer,
  originalName,
  mimeType,
  folder = "uploads",
  req,
}) => {
  const safeName = sanitizeFileName(originalName);
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeName}`;

  if (isCloudinaryConfigured()) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `event-portal/${folder}`,
          resource_type: "auto",
          public_id: path.parse(uniqueName).name,
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          return resolve(uploadResult);
        },
      );
      stream.end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      filename: safeName,
      mimeType,
      size: buffer.length,
      storage: "cloudinary",
      storagePath: result.secure_url,
    };
  }

  const targetDir = path.join(PUBLIC_DIR, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const relativePath = path.posix.join(folder, uniqueName);
  const absolutePath = path.join(PUBLIC_DIR, relativePath);

  await fs.writeFile(absolutePath, buffer);

  return {
    url: buildPublicUrl(req, `/${relativePath}`),
    publicId: relativePath,
    filename: safeName,
    mimeType,
    size: buffer.length,
    storage: "local",
    storagePath: relativePath,
  };
};

export const resolveLocalPublicPath = (relativePath) => path.join(PUBLIC_DIR, relativePath);

export const publicFileExists = async (relativePath) => {
  try {
    await fs.access(resolveLocalPublicPath(relativePath));
    return true;
  } catch {
    return false;
  }
};

export default {
  storeBuffer,
  resolveLocalPublicPath,
  publicFileExists,
  isCloudinaryConfigured,
};
