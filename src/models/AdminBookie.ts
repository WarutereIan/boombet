import { Schema, model } from "mongoose";
import { IAdmin_Bookie } from "../types/IAdmin_Bookie";

const AdminBookieSchema = new Schema<IAdmin_Bookie>({
  bookie: {
    type: String,
  },
  bookie_code: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
  img: {
    type: String,
  },
  referral_link: {
    type: String,
  },
  timestamp: {
    type: String,
  },
  personal_message: {
    type: String,
  },
});

export const AdminBookie = model<IAdmin_Bookie>(
  "AdminBookie",
  AdminBookieSchema
);
