const Result = require("../models/resultModel");

exports.publishResult = async (req, res, next) => {
  try {
    const { user, position, certificateUrl } = req.body;
    const result = await Result.create({
      event: req.params.eventId,
      user,
      position,
      certificateUrl,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getResults = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    const results = await Result.find(filter)
      .populate("user", "name")
      .populate("event", "title");
    res.json(results);
  } catch (err) {
    next(err);
  }
};
