export interface IEvent {
  id: number;
  sport_id: number;
  home_team_id: number;
  away_team_id: number;
  league_id: number;
  challenge_id: number;
  season_id: number;
  venue_id: number;
  referee_id: number;
  slug: string;
  name: string;
  status: string;
  status_more: string;
  time_details: any;
  home_team: {};
  away_team: {};
  start_at: string;
  priority: number;
  home_score: {
    current: number;
    display: number;
    period_1: number;
    period_2: number;
    normal_time: number;
  };
  away_score: {
    current: number;
    display: number;
    period_1: number;
    period_2: number;
    normal_time: number;
  };
  winner_code: number;
  aggregated_winner_code: any;
  result_only: boolean;
  coverage: any;
  ground_type: any;
  round_number: number;
  series_count: number;
  medias_count: any;
  status_lineup: number;
  first_supply: any;
  cards_code: string;
  event_data_change: string;
  lasted_period: string;
  default_period_count: number;
  attendance: any;
  cup_match_order: any;
  cup_match_in_round: any;
  periods: any;
  round_info: {
    round: number;
  };
  periods_time: any;
  main_odds: {
    outcome_1: {
      value: number;
      change: number;
    };
    outcome_X: {
      value: number;
      change: number;
    };
    outcome_2: {
      value: number;
      change: number;
    };
  };
  league: {};
  challenge: {};
  season: {};
  section: {};
  sport: {};
  live: boolean;
  prediction_changed: boolean;
  markets: [];
  lineups: [];
  incidents: [];
  stats: [];
  admin_prediction: [];
  date: string;
}
