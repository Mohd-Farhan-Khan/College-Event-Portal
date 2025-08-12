// User Roles
export const UserRolesEnum = {
    ADMIN: "admin",       // System-wide admin with full privileges
    COLLEGE: "college",   // College-level event organizer
    STUDENT: "student"    // Event participant
};

export const AvailableUserRole = Object.values(UserRolesEnum);

// Event Types
export const EventTypesEnum = {
    TECHNICAL: "technical",     // Technical fests, hackathons, coding contests
    CULTURAL: "cultural",       // Cultural fests, music, dance
    SPORTS: "sports",           // Sports competitions
    WORKSHOP: "workshop"        // Training or skill-building sessions
};

export const AvailableEventTypes = Object.values(EventTypesEnum);

// Event Status
export const EventStatusEnum = {
    SCHEDULED: "scheduled",         // Upcoming event
    IN_PROGRESS: "in_progress",     // Ongoing event
    COMPLETED: "completed"          // Event has finished
};

export const AvailableEventStatus = Object.values(EventStatusEnum);
