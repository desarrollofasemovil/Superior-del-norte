function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`, err.stack);

  // Estandarización del formato de error
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Ocurrió un error interno en el servidor.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  });
}

module.exports = errorHandler;
