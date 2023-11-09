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

    let { teamName } = req.body;

    try {
      let team = await Team.findOne({ name: teamName });
      //will need to make seacrh case insensitive
      if (team) {
        return res.status(200).json({ success: true, team });
      } else {
        return res.status(200).json({ success: false, msg: "Team not found" });
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
        return res.status(200).json({ success: false, msg: "Team not found" });
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
            .status(200)
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
}