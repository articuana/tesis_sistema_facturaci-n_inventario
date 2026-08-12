const ensureAdmin = (req, res, next) => {
  if (req.headers['x-user-role'] !== 'admin') {
    return res.status(403).json({ error: 'Se requiere permisos de administrador.' });
  }

  return next();
};

export { ensureAdmin };
