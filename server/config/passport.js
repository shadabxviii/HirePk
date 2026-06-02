import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  // Gracefully handle missing credentials for local testing
  if (
    !clientID || 
    clientID === "your_google_client_id_here" || 
    !clientSecret || 
    clientSecret === "your_google_client_secret_here"
  ) {
    console.warn("⚠️ Google OAuth credentials are not configured. Google Login is disabled.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0]?.value;
          if (!email) {
            return done(new Error("No email found in your Google profile."), null);
          }

          let user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Link Google ID if user registered with email/password previously
            if (!user.googleId) {
              user.googleId = profile.id;
              if (!user.avatar) {
                user.avatar = profile.photos && profile.photos[0]?.value;
              }
              await user.save();
            }
            return done(null, user);
          }

          // Generate default name if empty
          const name = profile.displayName || "Google User";

          // Create new user (Role defaults to jobseeker, can be updated later)
          user = await User.create({
            name,
            email: email.toLowerCase(),
            googleId: profile.id,
            avatar: (profile.photos && profile.photos[0]?.value) || "",
            role: "jobseeker",
            isVerified: true
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
