import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: ["IT", "Finance", "Marketing", "Design", "HR", "Sales", "Engineering", "Other"],
    required: true
  },
  type: { 
    type: String, 
    enum: ["full-time", "part-time", "internship", "remote", "contract"],
    required: true 
  },
  location: {
    city: { type: String, required: true, index: true },
    area: { type: String, index: true }
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: "PKR" },
    negotiable: { type: Boolean, default: false }
  },
  skillsRequired: [{ type: String, trim: true }],
  experienceLevel: { type: String, enum: ["entry", "mid", "senior"], default: "entry" },
  deadline: Date,
  status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
  views: { type: Number, default: 0 },
  applicantsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Text index for search
jobSchema.index({ title: "text", description: "text", "location.city": "text", "location.area": "text" });

export default mongoose.model("Job", jobSchema);
