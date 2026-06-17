const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const prisma = require('./prisma');

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

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
