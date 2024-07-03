const jwt = require('jsonwebtoken');
const User = require('../models/user');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    res.status(201).json({ status: 'success', token, data: { user: newUser } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'fail', message: 'Please provide username and password!' });
  }

  const user = await User.findOne({ username }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({ status: 'fail', message: 'Incorrect username or password' });
  }

  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
};

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({ status: 'fail', message: 'The user belonging to this token does no longer exist.' });
  }

  req.user = currentUser;
  next();
};
