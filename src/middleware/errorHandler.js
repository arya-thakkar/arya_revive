function errorHandler(err, req, res, next) { 
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message || err);

  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map((d) => d.message),
    });
  }

  if (err.code && err.message) {
    return res.status(400).json({ error: err.message, code: err.code });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
