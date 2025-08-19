import Registration from "../models/registrationModel.js";

export const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.body?.event_id || req.body?.event;
    if (!eventId) {
      return res.status(400).json({ message: "event_id is required" });
    }
    const registration = await Registration.create({
      user: req.user._id, // alias -> student_id
      event: eventId, // alias -> event_id
    });
    res.status(201).json(registration);
  } catch (err) {
    next(err);
  }
};

export const getRegistrations = async (req, res, next) => {
  try {
    const filter = {};
  const { event, event_id, user, student_id } = req.query;
  if (event || event_id) filter.event_id = event_id || event;
  if (user || student_id) filter.student_id = student_id || user;
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
    const updated = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("student_id", "name")
      .populate("event_id", "title");
    if (!updated) return res.status(404).json({ message: "Registration not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export default { registerForEvent, getRegistrations, updateRegistrationStatus };
