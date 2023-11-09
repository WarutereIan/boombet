import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../../models/User";
import { Password } from "../../helpers/password";

import { sign } from "jsonwebtoken";
import { config } from "../../config/config";
import { Bookie } from "../../models/Bookie";

import { Event } from "../../models/Event";
import { Team } from "../../models/Team";
import { League } from "../../models/League";

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

  let { bookie_code, name, img, referral_link, bookie, timestamp } = req.body;

  //admin selects fields to update, the rest remain unchanged

  try {
    let event = await Bookie.findOne({ bookie: bookie });
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

    await event.save();

    let updatedBookie = await Bookie.findOne({ bookie: bookie });

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

  let { bookie_code, name, img, referral_link, bookie, timestamp } = req.body;

  try {
    let event = await Bookie.create({
      bookie: bookie,
      bookie_code: bookie_code,
      name: name,
      img: img,
      referral_link: referral_link,
      timestamp: timestamp,
    });

    return res.status(200).json({ success: true, data: event });
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

  let { bookie } = req.body;

  try {
    let event = await Bookie.findOne({ bookie: bookie });

    if (!event)
      return res.status(404).json({
        success: false,
        data: "Bookie not found",
      });

    await event.deleteOne();

    return res
      .status(200)
      .json({ success: true, data: `Bookie ${bookie} deleted successfully` });
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
    let _event = await Event.findOne({ id: eventId });

    if (!_event)
      return res.status(404).json({
        success: false,
        data: "Event not found",
      });

    _event.main_odds = prediction;
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

    return res.status(200).json({ success: true, data: club });
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
