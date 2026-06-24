const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path}: ${err.value}`; }
  if (err.code === 11000) { status = 400; message = `${Object.keys(err.keyValue)[0]} already exists`; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Token expired'; }

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}: ${message}`);
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
