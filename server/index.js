const path = require('path');
const fs = require('fs/promises');
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
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');
const WORKS_FILE = path.join(DATA_DIR, 'works.json');
const CONTACT_FILE = path.join(DATA_DIR, 'contact_messages.json');

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        cb(null, UPLOADS_DIR);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.set('trust proxy', 1);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (!ALLOWED_ORIGIN || origin === ALLOWED_ORIGIN) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.resolve(__dirname, '..')));

let works = [];
let contactMessages = [];

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  try {
    const raw = await fs.readFile(WORKS_FILE, 'utf8');
    works = JSON.parse(raw);
  } catch {
    works = [];
    await fs.writeFile(WORKS_FILE, JSON.stringify(works, null, 2));
  }

  try {
    const raw = await fs.readFile(CONTACT_FILE, 'utf8');
    contactMessages = JSON.parse(raw);
  } catch {
    contactMessages = [];
    await fs.writeFile(CONTACT_FILE, JSON.stringify(contactMessages, null, 2));
  }
}

async function saveWorks() {
  await fs.writeFile(WORKS_FILE, JSON.stringify(works, null, 2));
}

async function saveContacts() {
  await fs.writeFile(CONTACT_FILE, JSON.stringify(contactMessages, null, 2));
}

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

  const publicBase = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${publicBase}/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

app.post('/api/works', requireAuth, async (req, res) => {
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
  await saveWorks();
  return res.status(201).json({ work });
});

app.post('/api/contact', async (req, res) => {
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
  await saveContacts();
  return res.status(201).json({ ok: true, messageId: row.id });
});

ensureStorage().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to initialize storage:', error);
  process.exit(1);
});
