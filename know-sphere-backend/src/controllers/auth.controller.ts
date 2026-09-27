import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { config } from '../config/env';

function signToken(userId: string, role: string, email: string): string {
  return jwt.sign({ id: userId, role, email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as any);
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'user', department } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) { res.status(409).json({ success: false, message: 'Email already registered' }); return; }

    const user = await UserModel.create({ name, email, password, role, department });
    const token = signToken(user.id, user.role, user.email);

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, department: user.department }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' }); return;
    }
    if (user.status === 'inactive') {
      res.status(403).json({ success: false, message: 'Account is deactivated' }); return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user.id, user.role, user.email);
    res.json({
      success: true,
      token,
      refreshToken: signToken(user.id, user.role, user.email),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, department: user.department, lastLogin: user.lastLogin }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, department: user.department, lastLogin: user.lastLogin } });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
