const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// ✅ Use PORT and JWT_SECRET from .env
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_jwt_secret';

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected."))
  .catch(err => console.error("MongoDB connection error:", err));

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorUsername: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

// ✅ JWT Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json("A token is required for authentication");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json("Invalid Token");
  }
  next();
};

// ✅ Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) return res.status(400).send("All input is required");

    const oldUser = await User.findOne({ username });
    if (oldUser) return res.status(409).send("User Already Exists. Please Login");

    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: encryptedPassword });

    res.status(201).json({ _id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) return res.status(400).send("All input is required");

    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: "2h" }
      );
      return res.json({
        token,
        user: { id: user._id, username: user.username }
      });
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(200).json({ message: 'If a user with that username exists, a password reset link has been sent.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Optional: Use frontend base URL from .env
    const clientURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${clientURL}/reset-password/${token}`;

    await transporter.sendMail({
      from: '"My Blog" <noreply@myblog.com>',
      to: user.username,
      subject: 'Password Reset Request',
      text: `Please use this link to reset your password:\n${resetLink}`,
    });

    console.log(`Password reset link sent: ${resetLink}`);
    res.json({ message: 'If a user with that username exists, a password reset link has been sent.' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Reset Password
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or expired.' });
    }

    const { password } = req.body;
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Posts: Create
app.post('/api/posts', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { userId, username } = req.user;

    const newPost = new Post({ title, content, author: userId, authorUsername: username });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Posts: Read
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Posts: Update
app.put('/api/posts/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json("Not authorized");
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Posts: Delete
app.delete('/api/posts/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json("Not authorized");
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json("Post has been deleted.");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
