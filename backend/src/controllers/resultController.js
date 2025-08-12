import Result from "../models/resultModel.js";

export const publishResult = async (req, res, next) => {
  try {
    const { user, position, certificateUrl } = req.body;
    const result = await Result.create({
      event: req.params.eventId, // alias -> event_id
      user, // alias -> student_id
      position,
      certificateUrl, // alias -> certificate_url
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.event_id = req.query.event;
    const results = await Result.find(filter)
      .populate("student_id", "name")
      .populate("event_id", "title");
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export default { publishResult, getResults };
