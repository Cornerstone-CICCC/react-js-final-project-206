import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { IUser, User } from '../models/user.model';
import userService from '../services/user.service';
import zxcvbn from 'zxcvbn';

/**
 * Sign up (add user)
 * @route POST /users/signup
 */
const signup = async (req: Request<{}, {}, Omit<IUser, 'id'>>, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate fields
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({
      message: 'Missing required registration fields!',
    });
    return;
  }

  // Password strength check
  const passwordCheck = zxcvbn(password);
  if (passwordCheck.score < 3) {
    res.status(400).json({
      message: 'Password is too weak!',
      suggestions: passwordCheck.feedback.suggestions,
      warning: passwordCheck.feedback.warning,
    });
    return;
  }

  // Check email exists
  const existingEmail = await userService.getValidateByEmail(email);
  if (existingEmail) {
    res.status(409).json({
      message: 'Email already exists!',
    });
    return;
  }

  // Create user
  const newUser = await userService.add({ firstName, lastName, email, password });
  if (!newUser) {
    res.status(500).json({
      message: 'Failed to create user!',
    });
    return;
  }

  res.status(201).json({
    message: 'User successfully registered!',
  });
};

/**
 * Log in (check user)
 * @route POST /users/login
 */
const login = async (
  req: Request<{}, {}, Omit<IUser, 'id' | 'firstName' | 'lastName' | 'partnerId'>>,
  res: Response,
) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({
      message: 'Email or password cannot be empty!',
    });
    return;
  }

  const result = await userService.login({ email, password });
  if (!result) {
    res.status(401).json({
      message: 'Incorrect email or password!',
    });
    return;
  }

  const { user } = result;

  // Set cookie session
  if (req.session) {
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();
    req.session.email = user.email;
  }

  res.status(200).json({
    message: 'Login successful!',
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
    },
  });
};

/**
 * Check Auth & Get Current User Info
 * @route GET /users/check-auth
 */
const checkAuth = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: 'Session expired or not logged in!',
    });
    return;
  }

  const user = await userService.getById(req.session.userId);

  if (!user) {
    res.status(404).json({
      message: 'User does not exist!',
    });
    return;
  }

  res.status(200).json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
};

/**
 * Update Profile (Email, Names, or Password)
 * @route PUT /users/profile
 */
const updateAccount = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: 'Not logged in!',
    });
    return;
  }

  const userId = req.session.userId;
  const { firstName, lastName, email, currPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(404).json({
        message: 'User not found.',
      });
      return;
    }

    // Email duplication check
    if (email && email.trim() !== user.email) {
      const existingEmail = await User.findOne({
        email: email.trim(),
        _id: { $ne: userId },
      });

      if (existingEmail) {
        res.status(409).json({
          message: 'Email already exists!',
        });
        return;
      }
    }

    // Password validation and hashing
    let finalPassword = user.password;

    if (currPassword || newPassword) {
      if (!currPassword || !newPassword) {
        res.status(400).json({
          message: 'Both current and new password are required.',
        });
        return;
      }

      // Password strength check
      const strength = zxcvbn(newPassword);
      if (strength.score < 3) {
        res.status(400).json({
          message: 'New password is too weak!',
          suggestions: strength.feedback.suggestions,
        });
        return;
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currPassword, user.password);
      if (!isMatch) {
        res.status(400).json({
          message: 'Incorrect current password.',
        });
        return;
      }

      // Hash new password
      finalPassword = await bcrypt.hash(newPassword, 12);
    }

    // Prepare update object
    const updateData = {
      firstName: firstName ? firstName.trim() : user.firstName,
      lastName: lastName ? lastName.trim() : user.lastName,
      email: email ? email.trim() : user.email,
      password: finalPassword,
    };

    // Final update
    const updatedUser = await userService.update(userId, updateData);

    if (!updatedUser) {
      res.status(404).json({
        message: 'User not found (during update)',
      });
      return;
    }

    // Update session info if email changed
    req.session.email = updatedUser.email;

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      },
    });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({
      message: 'Server error during update',
    });
  }
};

/**
 * Log out
 * @route POST /users/logout
 */
const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session = null;
  }
  res.status(200).json({
    message: 'Logout successful!',
  });
};

/**
 * Delete Account
 * @route DELETE /users/delete
 */
const deleteAccount = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: 'Not logged in!',
    });
    return;
  }

  const deleted = await userService.remove(req.session.userId);

  if (!deleted) {
    res.status(400).json({
      message: 'Failed to delete user!',
    });
    return;
  }

  req.session = null;
  res.status(200).json({
    message: 'Account deleted successfully!',
  });
};

export default {
  signup,
  login,
  checkAuth,
  updateAccount,
  logout,
  deleteAccount,
};
