import Result from "../models/resultModel.js";

export const publishResult = async (req, res, next) => {
  try {
    const { user, student_id, position, certificateUrl, certificate_url } = req.body;
    const eventId = req.params.eventId || req.body?.event_id || req.body?.event;
    if (!eventId) return res.status(400).json({ message: "event_id is required" });
    if (!user && !student_id) return res.status(400).json({ message: "student_id (or user) is required" });
    const result = await Result.create({
      event_id: eventId,
      student_id: user || student_id,
      position,
      certificate_url: certificateUrl || certificate_url,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const filter = {};
    const { event, event_id, user, student_id } = req.query;
    if (event || event_id) filter.event_id = event_id || event;
    if (user || student_id) filter.student_id = student_id || user;
    const results = await Result.find(filter)
      .populate("student_id", "name")
      .populate("event_id", "title");
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export default { publishResult, getResults };
