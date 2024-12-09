import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../../models/User";
import { Password } from "../../helpers/password";

import { sign } from "jsonwebtoken";
import { config } from "../../config/config";

import { Event } from "../../models/Event";
import { Team } from "../../models/Team";
import { League } from "../../models/League";
import { AdminBookie } from "../../models/AdminBookie";
import { RedisClient } from "../../config/db";
import { firestoreDb } from "../../config/firestore";

export const signUp = async (req: Request, res: Response) => {
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

  const { username, phone_number, email, password, confirm_password } =
    req.body;

  if (password !== confirm_password) {
    return res.status(400).json({
      msg: "Passwords do not match",
      success: false,
    });
  }

  if (await User.exists({ username })) {
    return res.status(400).json({
      msg: "Username already exists",
      success: false,
    });
  }
  if (await User.exists({ phone_number })) {
    return res.status(400).json({
      msg: "Phone Number already exists",
      success: false,
    });
  }
  if (await User.exists({ email })) {
    return res.status(400).json({
      msg: "Email already exists",
      success: false,
    });
  }

  //validate password
  const { error } = Password.validate(password);
  if (error) {
    return res.status(400).json({
      msg: error,
      success: false,
    });
  }

  try {
    //create user:
    const user = await User.create({
      username,
      phone_number,
      email,
      password,
      confirm_password,
    });

    let _user = {
      username: user.username,
    };

    const payload = {
      user: {
        id: user._id,
      },
    };
    sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: "1h",
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, success: true, _user });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
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

  let { password, email, phone_number } = req.body;

  try {
    let user;

    if (phone_number) {
      if (!(await User.exists({ phone_number }))) {
        // throw error if user does not exist
        return res.status(400).json({
          msg: "User does not exist",
          success: false,
        });
      }
      user = await User.findOne({ phone_number }).select(
        "password phone_number username"
      );
    } else {
      if (!(await User.exists({ email }))) {
        // throw error if user does not exist
        return res.status(400).json({
          msg: "User does not exist",
          success: false,
        });
      }

      user = await User.findOne({ email }).select(
        "password phone_number username"
      );
    }

    if (!user || !(await Password.compare(user.password, password))) {
      return res
        .status(400)
        .json({ msg: "Invalid credentials", success: false });
    }

    let _user = {
      username: user.username,
    };

    console.log(_user);

    // login user
    const payload = {
      id: user.id,
      phone_number: user.phone_number,
    };
    sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_TOKEN_EXPIRES_IN,
      },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          success: true,
          _user,
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Internal server error");
  }
};

export const updateBookie = async (req: Request, res: Response) => {
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

  let {
    bookie_code,
    name,
    img,
    referral_link,
    bookie,
    timestamp,
    personal_message,
  } = req.body;

  //admin selects fields to update, the rest remain unchanged

  try {
    let event = await AdminBookie.findOne({ bookie: bookie });
    if (!event)
      return res.status(404).json({
        success: false,
        data: "Bookie not found",
      });

    event.bookie_code = bookie_code;
    event.name = name;
    event.img = img;
    event.referral_link = referral_link;
    event.timestamp = timestamp;
    event.personal_message = personal_message;

    await event.save();

    let updatedBookie = await AdminBookie.findOne({ bookie: bookie });

    let adminBookies = await AdminBookie.find();

    await RedisClient.set("adminBookies", JSON.stringify(adminBookies));

    return res.status(200).json({ success: true, data: updatedBookie });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
};

export const addBookie = async (req: Request, res: Response) => {
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

  let {
    bookie_code,
    name,
    img,
    referral_link,
    bookie,
    timestamp,
    personal_message,
  } = req.body;

  try {
    if (await AdminBookie.exists({ bookie_code: bookie_code }))
      return res
        .status(500)
        .json({ success: false, msg: "Bookie with given code already exists" });

    let adminBookie = await AdminBookie.create({
      bookie: bookie,
      bookie_code: bookie_code,
      name: name,
      img: img,
      referral_link: referral_link,
      timestamp: timestamp,
      personal_message: personal_message,
    });

    let adminBookies = await AdminBookie.find();

    await RedisClient.set("adminBookies", JSON.stringify(adminBookies));

    return res.status(200).json({ success: true, data: adminBookie });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
};

export const deleteBookie = async (req: Request, res: Response) => {
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

  let { bookie_code } = req.body;

  try {
    let event = await AdminBookie.findOne({ bookie_code: bookie_code });

    if (!event)
      return res.status(404).json({
        success: false,
        data: "Bookie not found",
      });

    await event.deleteOne();

    let adminBookies = await AdminBookie.find();

    await RedisClient.set("adminBookies", JSON.stringify(adminBookies));

    return res.status(200).json({
      success: true,
      data: `Bookie ${bookie_code} deleted successfully`,
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
};

export const updatePrediction = async (req: Request, res: Response) => {
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

  let { eventId, prediction } = req.body;

  try {
    //change to firestore
    const EventsRef = firestoreDb.collection("Events");
    let eventRef = EventsRef.doc(`${eventId}`);
    const doc = await eventRef.get();

    if (!doc)
      return res.status(404).json({
        success: false,
        data: "Event not found",
      });

    let newDoc = await eventRef.update({
      admin_prediction: prediction,
      prediction_changed: true,
    });

    /* _event.admin_prediction = prediction;
    _event.prediction_changed = true;

    await _event.save();

    let event = await Event.findOne({ id: eventId });

    const dateToday = new Date()

    let month = dateToday.getUTCMonth() + 1;
    let year = dateToday.getFullYear();
        
    const date_string = `${year}-${month < 10 ? "0" + month : month}-${dateToday.getDate()<10? "0"+dateToday.getDate(): dateToday.getDate()}`
    let modified_matches = await Event.find({ date: date_string, prediction_changed: true })
    
    await RedisClient.set("modified_matches", JSON.stringify(modified_matches)) */

    return res.status(200).json({
      success: true,
      data: { msg: "Prediction changed successfully", newDoc },
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
};

export const uploadClub = async (req: Request, res: Response) => {
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

  let { club } = req.body;

  try {
    let _club = await Team.create(club);

    return res.status(200).json({ success: true, data: _club });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
};

export const uploadLeague = async (req: Request, res: Response) => {
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

  let { league } = req.body;

  try {
    let _league = await League.create(league);

    return res.status(200).json({ success: true, data: _league });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
};

export const deletePrediction = async (req: Request, res: Response) => {
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

  let { eventId } = req.body;

  try {
    let _event = await Event.findOne({ id: eventId });

    if (!_event)
      return res.status(404).json({
        success: false,
        data: "Event not found",
      });

    _event.admin_prediction = [];
    _event.prediction_changed = true;

    let event = await _event.save();

    return res.status(200).json({
      success: true,
      data: { msg: "Prediction changed successfully", event },
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
};

export const adminGetEventsByDate = async (req: Request, res: Response) => {
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
  let matches: any = {};

  console.log(date);

  try {
    const EventsRef = firestoreDb.collection("Events");
    const events = await EventsRef.where("date", "==", date).get();

    if (events.empty) {
      console.log("Events for day", date, "not found");
      return res.status(404).json({
        success: false,
        msg: "Events for given date not found",
      });
    }

    events.forEach((event: any) => {
      event.prediction_changed
        ? prediction_changed.push(event)
        : prediction_not_changed.push(event);
    });

    matches.prediction_changed = prediction_changed;
    matches.prediction_not_changed = prediction_not_changed;
    matches.count = events.size;

    return res.status(200).json({
      success: false,
      matches,
    });

    /* let _events: any[] = await Event.find({ date: date }).select(
      "id slug name start_at league_id home_team away_team home_score away_score main_odds league markets lineups incidents stats admin_prediction prediction_changed live"
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
      events.count = _events.length;

      return res.status(200).json({ success: true, events });
    } */
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};
