import { Schema, model } from "mongoose";
import { ITeam } from "../types/ITeam";

const TeamSchema = new Schema<ITeam>({
  id: Number,
  sport_id: Number,
  category_id: Number,
  venue_id: Number,
  manager_id: Number,
  slug: String,
  name: String,
  has_logo: Boolean,
  logo: String,
  name_translations: {
    en: String,
    ru: String,
    de: String,
    es: String,
    fr: String,
    zh: String,
    tr: String,
    el: String,
    it: String,
    nl: String,
    pt: String,
  },
  name_short: String,
  name_full: String,
  name_code: String,
  has_sub: Boolean,
  gender: String,
  is_nationality: Boolean,
  country_code: String,
  country: String,
  flag: String,
});

export const Team = model<ITeam>("Team", TeamSchema);
