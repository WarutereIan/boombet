import { Schema, model } from "mongoose";
import { IBookie } from "../types/IBookie";

const BookieSchema = new Schema<IBookie>({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  referral_link: {
    type: String,
  },
  bookie_code: {
    type: String,
  },
  timestamp: {
    type: String,
  },
  brand: {
    type: String,
  },
  bookie: {
    type: String,
  },
});

BookieSchema.index({ "$**": "text" });

export const Bookie = model<IBookie>("Bookie", BookieSchema);
