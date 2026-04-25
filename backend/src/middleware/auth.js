import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from './errorHandler.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Unauthorized');
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).select('email name');
    if (!user) throw new HttpError(401, 'Unauthorized');
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Invalid or expired token'));
    }
    next(e);
  }
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpire });
}
