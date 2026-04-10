import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";

export const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.body?.event_id || req.body?.event;
    if (!eventId) {
      return res.status(400).json({ message: "event_id is required" });
    }

    const event = await Event.findById(eventId).select("_id");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if registration already exists
    const existing = await Registration.findOne({
      student_id: req.user._id,
      event_id: eventId,
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already registered for this event",
        registration: existing,
      });
    }

    const registration = await Registration.create({
      user: req.user._id, // alias -> student_id
      event: eventId, // alias -> event_id
    });
    res.status(201).json(registration);
  } catch (err) {
    // Handle duplicate key error more gracefully
    if (err.code === 11000) {
      return res.status(409).json({
        message: "You have already registered for this event",
      });
    }
    next(err);
  }
};

export const getRegistrations = async (req, res, next) => {
  try {
    const filter = {};
    const { event, event_id, user, student_id, status } = req.query;
    if (event || event_id) filter.event_id = event_id || event;
    if (user || student_id) filter.student_id = student_id || user;
    if (status) filter.status = status;

    if (req.user.role === "college") {
      const ownedEvents = await Event.find({
        $or: [{ createdBy: req.user._id }, { college_id: req.user.college_id }],
      }).select("_id");
      const ownedEventIds = ownedEvents.map(({ _id }) => _id);
      if (filter.event_id) {
        const requestedEventId = filter.event_id.toString();
        const ownsRequestedEvent = ownedEventIds.some(
          (ownedEventId) => ownedEventId.toString() === requestedEventId,
        );
        if (!ownsRequestedEvent) {
          return res.json([]);
        }
      } else {
        filter.event_id = { $in: ownedEventIds };
      }
    }

    const regs = await Registration.find(filter)
      .populate("student_id", "name")
      .populate("event_id", "title");
    res.json(regs);
  } catch (err) {
    next(err);
  }
};

export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ["pending", "confirmed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const registration = await Registration.findById(id).populate(
      "event_id",
      "createdBy college_id title",
    );
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (req.user.role === "college") {
      const ownsEvent =
        registration.event_id?.createdBy?.toString() === req.user._id.toString() ||
        registration.event_id?.college_id?.toString() === req.user.college_id?.toString();
      if (!ownsEvent) {
        return res.status(403).json({ message: "Forbidden: event access denied" });
      }
    }

    registration.status = status;
    await registration.save();

    const updated = await registration.populate([
      { path: "student_id", select: "name" },
      { path: "event_id", select: "title" },
    ]);

    if (!updated) return res.status(404).json({ message: "Registration not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export default { registerForEvent, getRegistrations, updateRegistrationStatus };
