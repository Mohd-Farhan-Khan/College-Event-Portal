const Registration = require("../models/registrationModel");

exports.registerForEvent = async (req, res, next) => {
  try {
    const registration = await Registration.create({
      user: req.user._id,
      event: req.params.eventId,
    });
    res.status(201).json(registration);
  } catch (err) {
    next(err);
  }
};

exports.getRegistrations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.user) filter.user = req.query.user;
    const regs = await Registration.find(filter)
      .populate("user", "name")
      .populate("event", "title");
    res.json(regs);
  } catch (err) {
    next(err);
  }
};
