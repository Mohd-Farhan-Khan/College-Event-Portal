import Result from "../models/resultModel.js";

export const publishResult = async (req, res, next) => {
  try {
    const { user, student_id, position, certificateUrl, certificate_url } = req.body;
    const eventId = req.params.eventId || req.body?.event_id || req.body?.event;
    if (!eventId) return res.status(400).json({ message: "event_id is required" });
    if (!user && !student_id) return res.status(400).json({ message: "student_id (or user) is required" });
    const result = await Result.create({
      event: eventId, // alias -> event_id
      user: user || student_id, // alias -> student_id
      position,
      certificateUrl: certificateUrl || certificate_url, // alias -> certificate_url
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
