import Event from "../models/eventModel.js";
import Registration from "../models/registrationModel.js";
import Result from "../models/resultModel.js";

const getRefId = (value) => value?._id?.toString() || value?.toString?.();

const canManageEvent = (event, user) => {
  if (user.role === "admin") return true;
  return getRefId(event.createdBy) === user._id.toString()
    || getRefId(event.college_id) === getRefId(user.college_id);
};

export const createEvent = async (req, res, next) => {
  try {
    // Remove any id or _id fields from the request body to prevent ObjectId cast errors
    const eventData = { ...req.body };
    delete eventData.id;
    delete eventData._id;

    // College users should only create events for their own college.
    if (req.user.role === "college") {
      eventData.college = req.user.college_id;
    }

    // Create the event with the filtered data
    const event = await Event.create({
      ...eventData,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    // Log more details for debugging
    console.error("Event creation error:", err);
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
  const events = await Event.find().populate("college_id createdBy", "name");
    res.json(events);
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "college_id createdBy",
      "name",
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!canManageEvent(event, req.user)) {
      return res.status(403).json({ message: "Forbidden: event access denied" });
    }

    const updates = { ...req.body };
    delete updates.id;
    delete updates._id;
    delete updates.createdBy;

    const allowedFields = ["title", "description", "category", "date", "venue", "poster_url", "posterUrl", "college", "college_id"];
    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) continue;
      event[key] = value;
    }

    if (req.user.role === "college") {
      event.college = req.user.college_id;
    }

    await event.save();
    const populatedEvent = await Event.findById(event._id).populate("college_id createdBy", "name");
    res.json(populatedEvent);
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!canManageEvent(event, req.user)) {
      return res.status(403).json({ message: "Forbidden: event access denied" });
    }

    await Promise.all([
      Registration.deleteMany({ event_id: event._id }),
      Result.deleteMany({ event_id: event._id }),
      Event.deleteOne({ _id: event._id }),
    ]);

    res.json({
      message: "Event deleted successfully",
      deletedEventId: event._id,
    });
  } catch (err) {
    next(err);
  }
};

export default { createEvent, getEvents, getEvent, updateEvent, deleteEvent };
