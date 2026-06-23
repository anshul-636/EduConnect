const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const prisma = require('./prisma');

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL
);

if (googleConfigured) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        // Existing user — log them in normally
        return done(null, { user: existingUser, isNewUser: false });
      }

      // New user — DO NOT auto-create. Pass profile data so frontend can ask for role.
      return done(null, {
        isNewUser: true,
        pendingProfile: { email, name, googleId },
      });

    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  // Without this guard, registering passport-google-oauth20 with an undefined
  // clientID throws synchronously at require-time and crashes the whole backend
  // on startup — including everything unrelated to Google sign-in.
  console.warn(
    '⚠️  Google OAuth is not configured (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / ' +
    'GOOGLE_CALLBACK_URL). The server will still start — "Sign in with Google" will ' +
    'return a clear error instead of working. See backend/.env.example.'
  );
}

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
module.exports.googleConfigured = googleConfigured;