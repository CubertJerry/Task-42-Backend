const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Set up mail configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const user = new User({ email, password, firstName, lastName });
    await user.save();

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const mailOptions = {
      to: user.email,
      from: 'your-email@gmail.com',
      subject: 'Account Activation',
      text: `Please click on the following link to activate your account: \n\n
      http://localhost:3000/activate/${token}\n\n`
    };
    await transporter.sendMail(mailOptions);

    res.status(201).send({ message: 'Registration successful. Check your email for activation link.' });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).send({ message: 'Activation token is invalid or has expired' });
    }
    user.isActive = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.send({ message: 'Account activated successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isActive || !await bcrypt.compare(password, user.password)) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, 'jwt_secret', { expiresIn: '1h' });
    res.send({ token });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const mailOptions = {
      to: user.email,
      from: 'your-email@gmail.com',
      subject: 'Password Reset',
      text: `Please click on the following link to reset your password: \n\n
      http://localhost:3000/reset/${token}\n\n`
    };
    await transporter.sendMail(mailOptions);
    res.send({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).send({ message: 'Password reset token is invalid or has expired' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.send({ message: 'Password has been reset' });
  } catch (err) {
    res.status(500).send(err);
  }
};