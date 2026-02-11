import { IUser, User } from '../models/user.model';
import bcrypt from 'bcrypt';

// Get all users
const getAll = async () => {
  return await User.find();
};

// Get user by id
const getById = async (id: string) => {
  return await User.findById(id);
};

// Validation check
const getValidateByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// Get user by email for login
const getByEmail = async (email: string) => {
  return await User.findOne({ email }).select('+password');
};

// Create user
const add = async (newUser: Partial<IUser>) => {
  const { firstName, lastName, email, password } = newUser;

  // Required fields check
  if (!firstName || !lastName || !email || !password) return null;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return null;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  return user;
};

// Update user
const update = async (id: string, data: Partial<IUser>) => {
  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

// Delete user
const remove = async (id: string) => {
  return await User.findByIdAndDelete(id);
};

export interface IUserLogin {
  email: string;
  password: string;
}

// Login user
const login = async (details: IUserLogin) => {
  const { email, password } = details;
  const foundUser = await getByEmail(email);

  if (!foundUser) return null;

  // Compare provided password with hashed DB password
  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) return null;

  // Clean up sensitive data
  const userObj = foundUser.toObject();
  delete (userObj as any).password;

  return {
    user: userObj,
  };
};

export default {
  getAll,
  getById,
  getByEmail,
  getValidateByEmail,
  add,
  update,
  remove,
  login,
};
