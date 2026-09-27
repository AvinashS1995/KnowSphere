import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserModel } from '../models/user.model';

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password = 'Welcome@123', role = 'user', department } = req.body;
    const exists = await UserModel.findOne({ email });
    if (exists) { res.status(409).json({ success: false, message: 'Email already exists' }); return; }

    const user = await UserModel.create({ name, email, password, role, department });
    res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, role, department, status } = req.body;
    const user = await UserModel.findByIdAndUpdate(req.params.id, { name, role, department, status }, { new: true }).select('-password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.json({ success: true, status: user.status });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    user.password = 'Welcome@123';
    await user.save();
    res.json({ success: true, message: 'Password reset to Welcome@123' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
