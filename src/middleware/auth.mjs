import jwt from 'jsonwebtoken';
import config from '../config.mjs';

const appConfig = config[process.argv[2]] || config.development;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        code: 403,
        message: 'A token is required for authentication'
      });
    }

    try {
      const decoded = jwt.verify(token, appConfig.jwtSecret);
      req.user = decoded;
    } catch (err) {
      console.error('[ERROR] Auth Middleware verifyToken ->', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          code: 401,
          message: 'Token expired'
        });
      }
      return res.status(401).json({
        code: 401,
        message: 'Invalid Token'
      });
    }
  } else {
    return res.status(403).json({
      code: 403,
      message: 'Authorization header is missing'
    });
  }
  return next();
};

export default verifyToken;
