import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).select('_id email name');
    if (user) req.user = user;
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
}
