import { apiError } from "./apiError.js";

const parseDisposition = (header = "") => {
  const nameMatch = header.match(/name="([^"]+)"/i);
  const filenameMatch = header.match(/filename="([^"]*)"/i);

  return {
    name: nameMatch?.[1],
    filename: filenameMatch?.[1],
  };
};

export const parseMultipartForm = async (req, { maxBytes = 5 * 1024 * 1024 } = {}) => {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    throw new apiError(400, "multipart/form-data boundary is missing");
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > maxBytes) {
      throw new apiError(413, `File exceeds the ${Math.floor(maxBytes / (1024 * 1024))}MB limit`);
    }
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks);
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const parts = [];

  let cursor = body.indexOf(boundaryBuffer);
  while (cursor !== -1) {
    const nextBoundary = body.indexOf(boundaryBuffer, cursor + boundaryBuffer.length);
    if (nextBoundary === -1) break;

    const part = body.slice(cursor + boundaryBuffer.length + 2, nextBoundary - 2);
    cursor = nextBoundary;

    if (!part.length) continue;

    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) continue;

    const rawHeaders = part.slice(0, headerEnd).toString("utf8");
    const content = part.slice(headerEnd + 4);
    const headers = rawHeaders.split("\r\n");
    const dispositionHeader = headers.find((line) => line.toLowerCase().startsWith("content-disposition"));
    const typeHeader = headers.find((line) => line.toLowerCase().startsWith("content-type"));
    const disposition = parseDisposition(dispositionHeader || "");

    if (!disposition.name) continue;

    parts.push({
      name: disposition.name,
      filename: disposition.filename,
      contentType: typeHeader ? typeHeader.split(":")[1].trim() : "text/plain",
      data: content,
    });
  }

  const fields = {};
  const files = [];

  for (const part of parts) {
    if (part.filename) {
      files.push(part);
    } else {
      fields[part.name] = part.data.toString("utf8");
    }
  }

  return { fields, files };
};

export default { parseMultipartForm };
