import Result from "../models/resultModel.js";
import Event from "../models/eventModel.js";
import { apiError } from "../utils/apiError.js";
import generateCertificate from "../utils/certificateGen.js";
import { publicFileExists, resolveLocalPublicPath, storeBuffer } from "../utils/storage.js";

const getRefId = (value) => value?._id?.toString() || value?.toString?.();

const canAccessEvent = (event, user) => {
  if (user.role === "admin") return true;
  return getRefId(event.createdBy) === user._id.toString()
    || getRefId(event.college_id) === getRefId(user.college_id);
};

const getResultWithRelations = (id) => Result.findById(id)
  .populate("student_id", "name email")
  .populate({
    path: "event_id",
    select: "title college_id createdBy",
    populate: [
      { path: "college_id", select: "name" },
      { path: "createdBy", select: "name" },
    ],
  });

export const publishResult = async (req, res, next) => {
  try {
    const { user, student_id, position, certificateUrl, certificate_url } = req.body;
    const eventId = req.params.eventId || req.body?.event_id || req.body?.event;
    if (!eventId) return res.status(400).json({ message: "event_id is required" });
    if (!user && !student_id) return res.status(400).json({ message: "student_id (or user) is required" });

    const event = await Event.findById(eventId).select("createdBy college_id");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.user.role === "college") {
      const ownsEvent =
        event.createdBy?.toString() === req.user._id.toString() ||
        event.college_id?.toString() === req.user.college_id?.toString();
      if (!ownsEvent) {
        return res.status(403).json({ message: "Forbidden: event access denied" });
      }
    }

    const result = await Result.create({
      event_id: eventId,
      student_id: user || student_id,
      position,
      certificate_url: certificateUrl || certificate_url,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Result already published for this student and event",
      });
    }
    next(err);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const filter = {};
    const { event, event_id, user, student_id } = req.query;
    if (event || event_id) filter.event_id = event_id || event;
    if (user || student_id) filter.student_id = student_id || user;
    const results = await Result.find(filter)
      .populate("student_id", "name")
      .populate("event_id", "title");
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export const generateResultCertificate = async (req, res, next) => {
  try {
    const result = await getResultWithRelations(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    if (!canAccessEvent(result.event_id, req.user)) {
      return res.status(403).json({ message: "Forbidden: event access denied" });
    }

    const organizerName = result.event_id?.college_id?.name || result.event_id?.createdBy?.name || "College Event Portal";
    const issuedAt = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const certificateBuffer = await generateCertificate({
      userName: result.student_id?.name || "Student",
      eventTitle: result.event_id?.title || "Event",
      position: result.position,
      issuedAt,
      organizerName,
    });

    const stored = await storeBuffer({
      buffer: certificateBuffer,
      originalName: `${result.event_id?.title || "event"}-${result.student_id?.name || "student"}-certificate.pdf`,
      mimeType: "application/pdf",
      folder: "certificates",
      req,
    });

    result.certificate_storage = stored.storage;
    result.certificate_storage_path = stored.storagePath;
    result.certificate_url = `${req.protocol}://${req.get("host")}/api/results/${result._id}/certificate`;

    await result.save();

    const updatedResult = await getResultWithRelations(result._id);
    res.json(updatedResult);
  } catch (err) {
    next(err);
  }
};

export const downloadResultCertificate = async (req, res, next) => {
  try {
    const result = await getResultWithRelations(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    if (req.user.role === "student") {
      if (result.student_id?._id?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden: certificate access denied" });
      }
    } else if (req.user.role === "college" && !canAccessEvent(result.event_id, req.user)) {
      return res.status(403).json({ message: "Forbidden: event access denied" });
    }

    if (!result.certificate_url) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (result.certificate_storage === "local" && result.certificate_storage_path) {
      const fileExists = await publicFileExists(result.certificate_storage_path);
      if (!fileExists) {
        throw new apiError(404, "Certificate file not found");
      }

      return res.download(
        resolveLocalPublicPath(result.certificate_storage_path),
        `${result.event_id?.title || "event"}-certificate.pdf`,
      );
    }

    if (result.certificate_storage === "cloudinary" && result.certificate_storage_path) {
      return res.redirect(result.certificate_storage_path);
    }

    if (/^https?:\/\//i.test(result.certificate_url)) {
      return res.redirect(result.certificate_url);
    }

    return res.status(404).json({ message: "Certificate file not found" });
  } catch (err) {
    next(err);
  }
};

export default { publishResult, getResults, generateResultCertificate, downloadResultCertificate };
