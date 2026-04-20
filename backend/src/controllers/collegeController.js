import College from "../models/collegeModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import Registration from "../models/registrationModel.js";
import Result from "../models/resultModel.js";
import { deleteStoredFile } from "../utils/storage.js";

export const getColleges = async (req, res, next) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.json(colleges);
  } catch (err) {
    next(err);
  }
};

export const getCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });
    res.json(college);
  } catch (err) {
    next(err);
  }
};

export const createCollege = async (req, res, next) => {
  try {
    const college = await College.create({
      name: req.body?.name,
      location: req.body?.location,
      description: req.body?.description,
      logo_url: req.body?.logo_url || req.body?.logoUrl,
    });
    res.status(201).json(college);
  } catch (err) {
    next(err);
  }
};

export const updateCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });

    const allowedFields = ["name", "location", "description", "logo_url", "logoUrl"];
    for (const [key, value] of Object.entries(req.body || {})) {
      if (!allowedFields.includes(key)) continue;
      if (key === "logoUrl") {
        college.logo_url = value;
      } else {
        college[key] = value;
      }
    }

    await college.save();
    res.json(college);
  } catch (err) {
    next(err);
  }
};

export const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });

    // Clean up orphaned files: college logo + all event posters
    const events = await Event.find({ college_id: college._id }).select("_id poster_url");
    const eventIds = events.map((event) => event._id);

    // Delete stored files (logo + posters) — fire-and-forget, don't block on failures
    await Promise.allSettled([
      deleteStoredFile(college.logo_url),
      ...events.map((event) => deleteStoredFile(event.poster_url)),
    ]);

    await Promise.all([
      Registration.deleteMany({ event_id: { $in: eventIds } }),
      Result.deleteMany({ event_id: { $in: eventIds } }),
      Event.deleteMany({ college_id: college._id }),
      User.updateMany({ college_id: college._id }, { $unset: { college_id: 1 } }),
      College.deleteOne({ _id: college._id }),
    ]);

    res.json({
      message: "College deleted successfully",
      deletedCollegeId: college._id,
    });
  } catch (err) {
    next(err);
  }
};

export const getCollegeEvents = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id).select("_id");
    if (!college) return res.status(404).json({ message: "College not found" });

    const events = await Event.find({ college_id: college._id })
      .populate("college_id createdBy", "name")
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

export const getCollegeUsers = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id).select("_id");
    if (!college) return res.status(404).json({ message: "College not found" });

    const users = await User.find({ college_id: college._id }).select("-passwordHash");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getCollegeOverview = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });

    const events = await Event.find({ college_id: college._id }).select("_id title date");
    const eventIds = events.map((event) => event._id);

    const [usersCount, registrationsCount, confirmedRegistrations, resultsCount] = await Promise.all([
      User.countDocuments({ college_id: college._id }),
      Registration.countDocuments({ event_id: { $in: eventIds } }),
      Registration.countDocuments({ event_id: { $in: eventIds }, status: "confirmed" }),
      Result.countDocuments({ event_id: { $in: eventIds } }),
    ]);

    res.json({
      college,
      metrics: {
        usersCount,
        eventsCount: events.length,
        registrationsCount,
        confirmedRegistrations,
        resultsCount,
      },
      recentEvents: events
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege,
  getCollegeEvents,
  getCollegeUsers,
  getCollegeOverview,
};
