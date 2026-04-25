import { Environment } from '../models/Environment.js';
import { HttpError } from '../middleware/errorHandler.js';

async function deactivateOthers(userId, exceptId) {
  await Environment.updateMany({ user: userId, _id: { $ne: exceptId } }, { isActive: false });
}

export async function listEnvironments(req, res, next) {
  try {
    const list = await Environment.find({ user: req.user._id }).sort({ name: 1 }).lean();
    res.json({ environments: list });
  } catch (e) {
    next(e);
  }
}

export async function createEnvironment(req, res, next) {
  try {
    const { name, variables } = req.body;
    if (!name?.trim()) throw new HttpError(400, 'name is required');
    const doc = await Environment.create({
      name: name.trim(),
      user: req.user._id,
      variables: variables || [],
      isActive: false,
    });
    res.status(201).json({ environment: doc });
  } catch (e) {
    if (e.code === 11000) {
      return next(new HttpError(409, 'An environment with this name already exists'));
    }
    next(e);
  }
}

export async function updateEnvironment(req, res, next) {
  try {
    const doc = await Environment.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) throw new HttpError(404, 'Environment not found');
    const { name, variables, isActive } = req.body;
    if (name != null) doc.name = String(name).trim();
    if (variables != null) doc.variables = variables;
    if (isActive === true) {
      doc.isActive = true;
      await deactivateOthers(req.user._id, doc._id);
    } else if (isActive === false) {
      doc.isActive = false;
    }
    await doc.save();
    res.json({ environment: doc });
  } catch (e) {
    next(e);
  }
}

export async function deleteEnvironment(req, res, next) {
  try {
    const doc = await Environment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) throw new HttpError(404, 'Environment not found');
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
