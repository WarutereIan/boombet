//user functions: get list of live matches
//able to access league, team, event stats;
//access bookie data, convert betting codes

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { RedisClient } from "../../config/db";
import { Team } from "../../models/Team";
import { League } from "../../models/League";
import { Event } from "../../models/Event";
import { config } from "../../config/config";
import axios from "axios";

export const replaceImgUrl = (match: any) => {
  if (match.home_team.has_logo) {
    match.home_team.logo = match.home_team.logo.replace(
      "tipsscore.com",
      "xscore.cc"
    );
  }
  if (match.away_team.has_logo) {
    match.away_team.logo = match.away_team.logo.replace(
      "tipsscore.com",
      "xscore.cc"
    );
  }
  if (match.league.has_logo) {
    match.league.logo.replace("tipsscore.com", "xscore.cc");
  }
};

export class User {
  static async getListOfLiveMatches(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    try {
      let liveMatches: any = await RedisClient.get("LiveMatches");

      let data = JSON.parse(liveMatches);

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async getTeamStats(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { team_id } = req.body;

    try {
      let team = await Team.findOne({ id: team_id });
      //will need to make seacrh case insensitive
      if (team) {
        return res.status(200).json({ success: true, team });
      } else {
        return res.status(404).json({ success: false, msg: "Team not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  //will need to store corresponding league names and their ids in cache, then fetch ids from
  //there during search?
  static async getLeagueStats(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { leagueId } = req.body;

    try {
      //need to make league search case-insensitive, filling spaces with dashes

      //might include fuzzy search
      let league = await League.findOne({ id: leagueId });

      if (league) {
        return res.status(200).json({ success: true, league });
      } else {
        return res.status(404).json({ success: false, msg: "Team not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async getEventStats(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { event_id, league } = req.body; //use league name to lookup leagueid in cache

    try {
      if (event_id) {
        let event = await Event.findOne({ id: event_id });

        if (event) {
          replaceImgUrl(event);
          return res.status(200).json({ success: true, event });
        } else {
          return res
            .status(200)
            .json({ success: false, msg: "Event not found" });
        }
      } else {
        //gives events by league-id,
        //and by date
        let event = await Event.find({ league_id: league });

        if (event) {
          return res.status(200).json({ success: true, event });
        } else {
          return res
            .status(404)
            .json({ success: false, msg: "Event not found" });
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async getBookies(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    try {
      const _bookies = await RedisClient.get("bookies");

      if (!_bookies) throw new Error("Error fetching bookies from cache");

      const bookies = JSON.parse(_bookies);

      return res.status(200).json({ success: true, data: bookies });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  }

  static async convertBetCode(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { from, to, booking_code } = req.body;

    try {
      const baseUrl = config.BET_CONVERTER_BASE_URL;

      const options = {
        method: "GET",
        url: `${baseUrl}/conversion_v2`,
        params: {
          api_key: config.BET_CONVERTER_API_KEY,
          from: from,
          to: to,
          booking_code: booking_code,
        },
      };

      const response: any = await axios(options);

      return res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  }

  static async searchTeam(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { teamName } = req.body;

    try {
      let team = await Team.find({ $text: { $search: teamName } })
        .select("id slug name")
        .limit(10);
      //will need to make seacrh case insensitive
      if (team) {
        return res.status(200).json({ success: true, team });
      } else {
        return res.status(404).json({ success: false, msg: "Team not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async searchLeague(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { leagueName } = req.body;

    try {
      let league = await League.find({ $text: { $search: leagueName } })
        .select("id slug name_translations")
        .limit(10);
      //will need to make seacrh case insensitive
      if (league) {
        return res.status(200).json({ success: true, league });
      } else {
        return res
          .status(404)
          .json({ success: false, msg: "league not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async searchEventsByDate(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { date } = req.body;

    let prediction_changed: any[] = [];
    let prediction_not_changed: any[] = [];
    let events: any = {};

    console.log(date);

    try {
      let _events: any[] = await Event.find({ date: date }).select(
        "id slug name start_at league_id home_team away_team home_score away_score main_odds league markets lineups incidents stats admin_prediction prediction_changed"
      );
      //will need to make seacrh case insensitive
      if (_events != null || undefined) {
        for (const match of _events) {
          if (match.home_team.has_logo) {
            match.home_team.logo = match.home_team.logo.replace(
              "tipsscore.com",
              "xscore.cc"
            );
          }
          if (match.away_team.has_logo) {
            match.away_team.logo = match.away_team.logo.replace(
              "tipsscore.com",
              "xscore.cc"
            );
          }
          if (match.league.has_logo) {
            match.league.logo.replace("tipsscore.com", "xscore.cc");
          }

          match.prediction_changed
            ? prediction_changed.push(match)
            : prediction_not_changed.push(match);
        }

        events.prediction_changed = prediction_changed;
        events.prediction_not_changed = prediction_not_changed;

        return res.status(200).json({ success: true, events });
      } else {
        return res
          .status(404)
          .json({ success: false, msg: "Events not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async searchEventsByDateAndLeague(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { date, league_id } = req.body;

    let prediction_changed: any[] = [];
    let prediction_not_changed: any[] = [];
    let events: any = {};

    try {
      let _events = await Event.find({
        league_id: league_id,
        date: date,
      }).select(
        "id slug name start_at league_id home_team away_team home_score away_score main_odds league markets lineups incidents stats admin_prediction prediction_changed"
      );
      //will need to make seacrh case insensitive
      if (_events != null || undefined) {
        for (const match of _events) {
          replaceImgUrl(match);

          match.prediction_changed
            ? prediction_changed.push(match)
            : prediction_not_changed.push(match);
        }

        events.prediction_changed = prediction_changed;
        events.prediction_not_changed = prediction_not_changed;

        return res.status(200).json({ success: true, events });
      } else {
        return res
          .status(404)
          .json({ success: false, msg: "events not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async getAdminBookies(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    try {
      let _adminBookies: any = await RedisClient.get("adminBookies");

      if (_adminBookies || _adminBookies == null) {
        let adminBookies = JSON.parse(_adminBookies);

        return res.status(200).json({ success: true, adminBookies });
      } else {
        throw new Error("Could not  fetch admin bookies from cache");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  }

  static async getEventLineups(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { event_id } = req.body;

    try {
      let event = await Event.findOne({ id: event_id });

      if (event) {
        return res.status(200).json({
          success: true,
          msg: event.lineups,
        });
      }
      return res.status(404).json({
        success: false,
        msg: "Event not found",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }

  static async searchEventByTeamAndDate(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    let { home_team_id, away_team_id, date } = req.body;

    try {
      let _event = await Event.find({
        home_team_id: home_team_id,
        away_team_id: away_team_id,
        date: date,
      }).limit(10);

      console.log(_event);

      if (_event.length > 0) {
        return res.status(200).json({
          success: true,
          _event,
        });
      } else {
        return res.status(404).json({ success: false, msg: "Event not found" });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, msg: "Internal server error" });
    }
  }
}
