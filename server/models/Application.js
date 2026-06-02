import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverLetter: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  audioPitchUrl: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "viewed", "shortlisted", "interviewing", "rejected", "hired"],
    default: "pending"
  },
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Application", applicationSchema);
