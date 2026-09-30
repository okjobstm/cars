import User from '../models/User.js';
import { generateToken, setTokenCookie, clearTokenCookie, invalidateUserCache } from '../middlewares/auth.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {
  transporter,
  MailOptions,
  VERIFICATION_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  generateOTP
} from '../utils/emailService.js';

const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(e => e.message).join(', ');
    return res.status(400).json({ message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error' });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log(`[REGISTER] Starting registration for ${email}`);

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.log(`[REGISTER] User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationOtp = generateOTP();
    const verificationOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`[REGISTER] Creating user document...`);
    const startTime = Date.now();
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'client',
      isVerified: false,
      verificationOtp,
      verificationOtpExpireAt
    });
    console.log(`[REGISTER] User created in ${Date.now() - startTime}ms`);

    if (user) {
      const emailContent = VERIFICATION_TEMPLATE
        .replace('{{username}}', username)
        .replace('{{otp}}', verificationOtp);

      const mailOptions = new MailOptions({
        to: email,
        subject: 'Car Dealership - Verify Your Email',
        html: emailContent
      });

      console.log(`[REGISTER] Sending verification email...`);
      const emailStartTime = Date.now();
      try {
        await transporter.sendMail(mailOptions);
        console.log(`[REGISTER] Email sent in ${Date.now() - emailStartTime}ms`);
      } catch (emailError) {
        console.error(`[REGISTER] Email sending failed in ${Date.now() - emailStartTime}ms`, emailError);
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
      }

      const token = generateToken(user._id);
      setTokenCookie(res, token);

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: false,
        token: token // Still return token for mobile apps or if needed
      });
    }
  } catch (error) {
    console.error('[REGISTER] CRITICAL ERROR:', error);
    return handleError(res, error);
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({
          message: 'Email not verified',
          requiresVerification: true,
          email: user.email
        });
      }

      const token = generateToken(user._id);
      setTokenCookie(res, token);

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: token // Still return token for mobile apps or if needed
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update text fields if provided
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;

    // Only upload & update profilePicture if a file was actually sent
    if (req.file) {
      const profileLocalPath = req.file.path.replace(/\\/g, "/");
      const profile = await uploadOnCloudinary(profileLocalPath);
      if (!profile || (!profile.url && !profile.secure_url)) {
        return res.status(400).json({ message: "Error while uploading profile picture" });
      }
      user.profilePicture = profile.secure_url || profile.url;
    }

    const updatedUser = await user.save();

    const token = generateToken(updatedUser._id);
    setTokenCookie(res, token);

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      token,
    });
  } catch (error) {
    console.error("[updateUserProfile error]", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getUsers = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 200);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({}).select('-password').skip(skip).limit(limit),
      User.countDocuments()
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const logoutUser = async (req, res) => {
  try {
    invalidateUserCache(req.user?._id);
    clearTokenCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent deleting last remaining admin
      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot delete the last remaining admin' });
        }
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      email,
      verificationOtp: otp,
      verificationOtpExpireAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpireAt = undefined;
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      message: 'Email verified successfully',
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: true,
      token
    });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationOtp = generateOTP();
    const verificationOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.verificationOtp = verificationOtp;
    user.verificationOtpExpireAt = verificationOtpExpireAt;
    await user.save();

    const emailContent = VERIFICATION_TEMPLATE
      .replace('{{username}}', user.username)
      .replace('{{otp}}', verificationOtp);

    const mailOptions = new MailOptions({
      to: email,
      subject: 'Car Dealership - Verify Your Email',
      html: emailContent
    });

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('[resendVerificationOtp] Email error:', emailError.message);
      return res.status(500).json({ message: 'Failed to send verification email. Check SMTP config.' });
    }

    res.json({ message: 'Verification OTP sent successfully' });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetOtp = generateOTP();
    const resetOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetOtp = resetOtp;
    user.resetOtpExpireAt = resetOtpExpireAt;
    await user.save();

    const emailContent = PASSWORD_RESET_TEMPLATE
      .replace('{{email}}', email)
      .replace('{{otp}}', resetOtp);

    const mailOptions = new MailOptions({
      to: email,
      subject: 'Car Dealership - Password Reset',
      html: emailContent
    });

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('[requestPasswordReset] Email error:', emailError.message);
      return res.status(500).json({ message: 'Failed to send reset email. Check SMTP configuration.' });
    }

    res.json({ message: 'Password reset OTP sent successfully' });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }

    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpireAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};
