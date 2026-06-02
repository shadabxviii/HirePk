import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  logo: { type: String, default: "" },
  logoPublicId: String,
  website: String,
  industry: String,
  size: { type: String, enum: ["1-10", "11-50", "51-200", "201-500", "500+"] },
  city: { type: String, required: true },
  area: String,
  description: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Company", companySchema);
