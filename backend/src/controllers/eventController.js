import Event from "../models/eventModel.js";

export const createEvent = async (req, res, next) => {
  try {
    // Remove any id or _id fields from the request body to prevent ObjectId cast errors
    const { id, _id, ...eventData } = req.body;
    
    // Create the event with the filtered data
    const event = await Event.create({ 
      ...eventData, 
      createdBy: req.user._id 
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

export default { createEvent, getEvents, getEvent };
