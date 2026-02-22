const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-env';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

app.use(express.static(path.resolve(__dirname, '..')));

const works = [];
const contactMessages = [];

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'rezbarstvi-chudy-api' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  if (!ADMIN_PASSWORD_HASH) {
    return res.status(500).json({ error: 'Server auth not configured' });
  }

  const usernameOk = username === ADMIN_USERNAME;
  const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

  if (!usernameOk || !passwordOk) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.user = { username: ADMIN_USERNAME };
  return res.json({ user: req.session.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(200).json({ authenticated: false, user: null });
  }
  return res.json({ authenticated: true, user: req.session.user });
});

app.get('/api/works', (req, res) => {
  res.json({ works });
});

app.post('/api/uploads', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Only jpeg/png/webp files are allowed' });
  }

  const fakeUrl = `https://storage.example.com/${Date.now()}-${req.file.originalname}`;
  return res.json({ url: fakeUrl });
});

app.post('/api/works', requireAuth, (req, res) => {
  const { name, category, description, imageUrl } = req.body || {};

  if (!name || !category || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const work = {
    id: Date.now(),
    name,
    category,
    description,
    imageUrl: imageUrl || null,
    createdAt: new Date().toISOString(),
    createdBy: req.session.user.username,
  };

  works.push(work);
  return res.status(201).json({ work });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const row = {
    id: Date.now(),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };

  contactMessages.push(row);
  return res.status(201).json({ ok: true, messageId: row.id });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
