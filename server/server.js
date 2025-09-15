const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL // This will be 'https://aryanrajblogs.netlify.app' on Render
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, false); // Disallow gracefully
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch(err => console.error("MongoDB connection error:", err));

const COMMUNITIES = ["Coding & Development", "Technology & Gadgets", "Health & Wellness", "Travel & Adventure", "Food & Cooking", "Finance & Investing", "Arts & Culture", "Personal Growth"];

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorUsername: { type: String, required: true },
  community: { type: String, required: true, enum: COMMUNITIES },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: "A token is required" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  return next();
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });
    const oldUser = await User.findOne({ $or: [{ username }, { email }] });
    if (oldUser) return res.status(409).json({ message: "User already exists" });
    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: encryptedPassword });
    res.status(201).json({ _id: user._id, username: user.username });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// THIS LOGIN ROUTE IS NOW FIXED AND WILL NOT CRASH
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ username });
    // This check ensures 'user' exists before trying to compare passwords
    if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
    return res.status(200).json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error(err); // Log the actual error on the server
    res.status(500).json({ message: "Server error during login" });
  }
});

// ROUTES ARE RENAMED TO /api/articles
app.post('/api/articles', verifyToken, async (req, res) => {
  try {
    const { title, content, community } = req.body;
    const { userId, username } = req.user;
    if (!title || !content || !community || !COMMUNITIES.includes(community)) return res.status(400).json({ message: "Valid fields required." });
    const newPost = new Post({ title, content, community, author: userId, authorUsername: username });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/articles', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/articles/community/:communityName', async (req, res) => {
  try {
    const decodedCommunityName = decodeURIComponent(req.params.communityName);
    if (!COMMUNITIES.includes(decodedCommunityName)) return res.status(404).json({ message: "Community not found." });
    const posts = await Post.find({ community: decodedCommunityName }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/articles/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.userId) return res.status(403).json({ message: "Not authorized" });
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedPost);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/articles/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.userId) return res.status(403).json({ message: "Not authorized" });
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post has been deleted." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});