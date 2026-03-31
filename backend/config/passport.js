const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // 1. ✅ Check by googleId first — returning user
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user); // ✅ already exists, stop here

    // 2. ✅ Check by email — user registered locally before
    user = await User.findOne({ email });
    if (user) {
      user.googleId = profile.id; // link google to existing account
      await user.save();
      return done(null, user); // ✅ found by email, stop here
    }

    // 3. ✅ Brand new user — nothing matched above
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      email,
      avatar: profile.photos[0].value,
    });

    return done(null, user);

  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});