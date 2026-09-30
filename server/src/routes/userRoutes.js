import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  logoutUser,
  requestPasswordReset,
  resetPassword
} from '../controllers/userController.js';
import { protect, admin } from '../middlewares/auth.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Rely on global CORS middleware; route-level override removed for production hardening.

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

// Email verification and password reset routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser);

  // Admin system status (counts)
  router.get('/admin/status/summary', protect, admin, async (req, res) => {
    try {
      const [userCount, carCount, adminCount] = await Promise.all([
        User.countDocuments(),
        Car.countDocuments(),
        User.countDocuments({ role: 'admin' })
      ]);
      res.json({ userCount, carCount, adminCount });
    } catch (e) {
      res.status(500).json({ message: 'Echec de la recuperation du statut' });
    }
  });

// Promote a user to admin (super-admin only: must already be admin)
router.post('/admin/promote/:userId', protect, admin, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Vous etes deja administrateur.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.role === 'admin') return res.status(200).json({ message: 'L\'utilisateur est deja administrateur', user });
    user.role = 'admin';
    await user.save();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT] ${req.user._id} promoted user ${user._id} at ${new Date().toISOString()}`);
    }
    res.json({ message: 'Utilisateur promu administrateur', user: { _id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Echec de la promotion de l\'utilisateur' });
  }
});

// Demote an admin back to client (cannot demote last remaining admin)
router.post('/admin/demote/:userId', protect, admin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.role !== 'admin') return res.status(400).json({ message: 'L\'utilisateur n\'est pas administrateur' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Impossible de retrograder le dernier administrateur' });
    }
    user.role = 'client';
    await user.save();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT] ${req.user._id} demoted user ${user._id} at ${new Date().toISOString()}`);
    }
    res.json({ message: 'Utilisateur retrograde en client', user: { _id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Echec de la retrogradation de l\'utilisateur' });
  }
});

export default router;
