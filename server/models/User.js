import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // Null for OAuth users
  googleId: { type: String },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["jobseeker", "employer", "admin"], default: "jobseeker" },
  profile: {
    headline: String,
    bio: String,
    skills: [{ type: String, trim: true }],
    resumeUrl: String,
    resumePublicId: String,
    audioPitchUrl: String,
    city: { type: String, default: "" },
    area: { type: String, default: "" },
    phone: String,
    socials: {
      linkedin: String,
      github: String,
      portfolio: String
    }
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
