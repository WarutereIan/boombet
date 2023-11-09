import { Schema, model } from "mongoose";
import { IEvent } from "../types/IEvents";

const EventSchema = new Schema<IEvent>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  sport_id: Number,
  home_team_id: Number,
  away_team_id: Number,
  league_id: Number,
  challenge_id: Number,
  season_id: Number,
  venue_id: Number,
  referee_id: Number,
  slug: String,
  name: String,
  status: String,
  status_more: String,

  home_team: {},
  away_team: {},
  start_at: String,
  priority: Number,
  home_score: {
    current: Number,
    display: Number,
    period_1: Number,
    period_2: Number,
    normal_time: Number,
  },
  away_score: {
    current: Number,
    display: Number,
    period_1: Number,
    period_2: Number,
    normal_time: Number,
  },
  winner_code: Number,

  result_only: Boolean,
  //coverage: any,
  //ground_type: any,
  round_number: Number,
  series_count: Number,
  //medias_count: any,
  status_lineup: Number,
  //first_supply: any,
  cards_code: String,
  event_data_change: String,
  lasted_period: String,
  default_period_count: Number,
  /*  attendance: any,
  cup_match_order: any,
  cup_match_in_round: any,
  periods: any, */
  round_info: {
    round: Number,
  },
  //periods_time: any,
  main_odds: {
    outcome_1: {
      value: Number,
      change: Number,
    },
    outcome_X: {
      value: Number,
      change: Number,
    },
    outcome_2: {
      value: Number,
      change: Number,
    },
  },
  league: {},
  challenge: {},
  season: {},
  section: {},
  sport: {},
  live: {
    type: Boolean,
    default: false,
  },
  prediction_changed: {
    type: Boolean,
    default: false,
  },
  markets: {
    type: [],
    default: [],
  },
  lineups: {
    type: [],
    default: [],
  },
  incidents: {
    type: [],
    default: [],
  },
  stats: {
    type: [],
    default: [],
  },
});

export const Event = model<IEvent>("Event", EventSchema);
