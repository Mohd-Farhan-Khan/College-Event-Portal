import College from "../models/collegeModel.js";
import Event from "../models/eventModel.js";
import Registration from "../models/registrationModel.js";
import Result from "../models/resultModel.js";
import User from "../models/userModel.js";

const getRefId = (value) => value?._id?.toString() || value?.toString?.();

const getScopedEventIds = async (user, requestedCollegeId) => {
  if (user.role === "admin") {
    const eventFilter = requestedCollegeId ? { college_id: requestedCollegeId } : {};
    const events = await Event.find(eventFilter).select("_id");
    return events.map((event) => event._id);
  }

  const events = await Event.find({
    $or: [{ createdBy: user._id }, { college_id: user.college_id }],
  }).select("_id");
  return events.map((event) => event._id);
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const collegeId = req.query?.college_id || req.query?.college;
    const eventFilter = collegeId ? { college_id: collegeId } : {};
    const userFilter = collegeId ? { college_id: collegeId } : {};
    const scopedEvents = await Event.find(eventFilter).select("_id title category date");
    const eventIds = scopedEvents.map((event) => event._id);
    const registrationFilter = eventIds.length ? { event_id: { $in: eventIds } } : (collegeId ? { event_id: { $in: [] } } : {});
    const resultFilter = eventIds.length ? { event_id: { $in: eventIds } } : (collegeId ? { event_id: { $in: [] } } : {});

    const [users, collegesCount, registrations, results] = await Promise.all([
      User.find(userFilter).select("role"),
      collegeId ? Promise.resolve(1) : College.countDocuments(),
      Registration.find(registrationFilter).populate("event_id", "title category"),
      Result.find(resultFilter).populate("event_id", "title category"),
    ]);

    const roleDistribution = {
      student: users.filter((user) => user.role === "student").length,
      college: users.filter((user) => user.role === "college").length,
      admin: users.filter((user) => user.role === "admin").length,
    };

    const categories = {};
    for (const event of scopedEvents) {
      const key = event.category || "uncategorized";
      categories[key] = (categories[key] || 0) + 1;
    }

    const topEvents = scopedEvents.map((event) => {
      const registrationsCount = registrations.filter(
        (registration) => getRefId(registration.event_id) === event._id.toString(),
      ).length;
      const resultsCount = results.filter(
        (result) => getRefId(result.event_id) === event._id.toString(),
      ).length;

      return {
        eventId: event._id,
        title: event.title,
        category: event.category || "uncategorized",
        registrationsCount,
        resultsCount,
      };
    }).sort((a, b) => b.registrationsCount - a.registrationsCount).slice(0, 5);

    res.json({
      scope: collegeId ? "college" : "platform",
      totals: {
        usersCount: users.length,
        collegesCount,
        eventsCount: scopedEvents.length,
        registrationsCount: registrations.length,
        confirmedRegistrations: registrations.filter((registration) => registration.status === "confirmed").length,
        resultsCount: results.length,
      },
      roleDistribution,
      categoryDistribution: categories,
      topEvents,
    });
  } catch (err) {
    next(err);
  }
};

export const getCollegeAnalytics = async (req, res, next) => {
  try {
    const collegeId = req.user.role === "admin"
      ? req.query?.college_id || req.query?.college
      : req.user.college_id;

    const eventIds = await getScopedEventIds(req.user, collegeId);
    const eventFilter = { _id: { $in: eventIds } };

    const [events, registrations, results, college] = await Promise.all([
      Event.find(eventFilter).select("title category date"),
      Registration.find({ event_id: { $in: eventIds } }).populate("event_id", "title"),
      Result.find({ event_id: { $in: eventIds } }).populate("event_id", "title"),
      collegeId ? College.findById(collegeId).select("name") : Promise.resolve(null),
    ]);

    const registrationsByStatus = {
      pending: registrations.filter((registration) => registration.status === "pending").length,
      confirmed: registrations.filter((registration) => registration.status === "confirmed").length,
      cancelled: registrations.filter((registration) => registration.status === "cancelled").length,
    };

    const topEvents = events.map((event) => ({
      eventId: event._id,
      title: event.title,
      category: event.category || "uncategorized",
      registrationsCount: registrations.filter(
        (registration) => getRefId(registration.event_id) === event._id.toString(),
      ).length,
      resultsCount: results.filter(
        (result) => getRefId(result.event_id) === event._id.toString(),
      ).length,
    })).sort((a, b) => b.registrationsCount - a.registrationsCount).slice(0, 5);

    res.json({
      scope: req.user.role === "admin" ? "admin-college" : "college",
      college: college ? { id: college._id, name: college.name } : null,
      totals: {
        eventsCount: events.length,
        registrationsCount: registrations.length,
        resultsCount: results.length,
      },
      registrationsByStatus,
      topEvents,
    });
  } catch (err) {
    next(err);
  }
};

export default { getAdminAnalytics, getCollegeAnalytics };
