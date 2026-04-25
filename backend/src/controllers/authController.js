import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new HttpError(409, 'Email already registered');
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), password: hash, name: name || '' });
    const token = signToken(user._id.toString());
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new HttpError(401, 'Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(401, 'Invalid credentials');
    const token = signToken(user._id.toString());
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  res.json({ user: { id: req.user._id, email: req.user.email, name: req.user.name } });
}
