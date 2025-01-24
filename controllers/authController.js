//server\controllers\authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Helper Functions
const doesUserExist = async (email) => User.exists({ email });

const hashUserPassword = async (password) => bcrypt.hash(password, 10);

const createUserInstance = (data) => new User(data);

const prepareUpdateData = async ({ fullName, password, subscriptionStatus }) => {
  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (password) updateData.password = await hashUserPassword(password);
  if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
  return updateData;
};

const findUserById = async (userId) => User.findById(userId).select('-password');

// Controller Functions
const registerUser = async (req, res) => {
  const { fullName, email, password, role = 'user', subscriptionStatus = 'false' } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  try {
    if (await doesUserExist(email)) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await hashUserPassword(password);
    const newUser = createUserInstance({ fullName, email, password: hashedPassword, role, subscriptionStatus });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Error in registerUser:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ message: 'Internal server error.' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1d' });
    console.log('User logged in:', user.email, token);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (err) {
    console.error('Error in loginUser:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateProfile = async (req, res) => {
  const { fullName, password, subscriptionStatus } = req.body;

  try {
    const updateData = await prepareUpdateData({ fullName, password, subscriptionStatus });
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updateData, { new: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteUser,
};
