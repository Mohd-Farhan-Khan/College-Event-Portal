// Central error handler
const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  // Handle common MongoDB errors
  if (err.name === 'MongoServerError') {
    // Handle duplicate key error
    if (err.code === 11000) {
      // Extract the field that caused the duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      
      // Special handling for registration
      if (err.message.includes('college_event_portal.registrations')) {
        return res.status(409).json({
          message: "You have already registered for this event",
        });
      }
      
      return res.status(409).json({
        message: `Duplicate value for ${field}`,
        field
      });
    }
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
