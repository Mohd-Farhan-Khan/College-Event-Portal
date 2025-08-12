import Registration from "../models/registrationModel.js";

export const registerForEvent = async (req, res, next) => {
  try {
    const registration = await Registration.create({
      user: req.user._id, // alias -> student_id
      event: req.params.eventId, // alias -> event_id
    });
    res.status(201).json(registration);
  } catch (err) {
    next(err);
  }
};

export const getRegistrations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event_id = req.query.event;
    if (req.query.user) filter.student_id = req.query.user;
    const regs = await Registration.find(filter)
      .populate("student_id", "name")
      .populate("event_id", "title");
    res.json(regs);
  } catch (err) {
    next(err);
  }
};

export default { registerForEvent, getRegistrations };
