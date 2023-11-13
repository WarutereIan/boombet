import { Schema, model } from "mongoose";
import { ILeague } from "../types/ILeagues";

const LeagueSchema = new Schema<ILeague>({
  id: Number,
  sport_id: Number,
  section_id: Number,
  slug: String,
  name_translations: {
    en: String,
    ru: String,
  },
  has_logo: Boolean,
  logo: String,
  start_date: String,
  end_date: String,
  priority: Number,
  host: {
    country: String,
    flag: String,
  },
  tennis_points: Number,
  facts: [
    {
      name: String,
      value: String,
    },
    {
      name: String,
      value: String,
    },
    {
      name: String,
      value: String,
    },
    {
      name: String,
      value: String,
    },
    {
      name: String,
      value: String,
    },
    {
      name: String,
      value: String,
    },
    {
      name: String,
      value: String,
    },
    {
      name: String,
      value: String,
    },
  ],
  most_count: Number,
});

LeagueSchema.index({ slug: "text", name_translations: "text" });

export const League = model<ILeague>("League", LeagueSchema);
