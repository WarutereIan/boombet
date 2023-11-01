import { Schema, model } from "mongoose";
import { IBookie } from "../types/IBookie";

const BookieSchema = new Schema<IBookie>({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  referral_link: {
    type: String,
    required: true,
  },
  bookie_code: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
});

export const Bookie = model<IBookie>("Bookie", BookieSchema);
