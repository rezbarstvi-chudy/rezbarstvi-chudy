const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// GitHub OAuth configuration
passport.use(new GitHubStrategy({
  clientID: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  callbackURL: 'http://localhost:3000/auth/github/callback'
}, function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use(session({ secret: 'your secret key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Route for GitHub authentication
app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// GitHub callback route
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, check if user is authorized.
  if (req.user.username === 'rezbarstvi-chudy') {
    res.redirect('/admin'); // Redirect to admin features
  } else {
    res.redirect('/'); // Not authorized
  }
});

app.get('/admin', (req, res) => {
  if (!req.isAuthenticated() || req.user.username !== 'rezbarstvi-chudy') {
    return res.status(403).send('Access denied');
  }
  res.send('Welcome to the admin area!');
});

app.get('/', (req, res) => {
  res.send('Home Page');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});