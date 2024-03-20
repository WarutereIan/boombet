import axios from "axios";
import { Event } from "../models/Event";
import { connectDB } from "../config/db";
import { config } from "../config/config";
import { response } from "express";
import { sleep } from "../../utils/sleepFunction";

const date = new Date();

let day: any = date.getDate();

if (day / 10 < 1) {
  day = `0${day}`;
}
let month = date.getUTCMonth() + 1;
let year = date.getFullYear();

//day format with which to query api for events

let dateToday = `${year}-${month < 10 ? "0" + month : month}-${day}`;

export const checkDailyEvents = async () => {
  const options = {
    method: "GET",
    url: `https://sportscore1.p.rapidapi.com/sports/1/events/date/${dateToday}`,
    headers: {
      "X-RapidAPI-Key": config.RAPID_API_KEY,
      "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
    },
  };

  try {
    console.log("axios request -checkDailyEvents-", dateToday);
    let res: any = await axios(options);

    let events: any = res.data.data;

    for (const event of events) {
      for (let i = 0; i < 2; i++) {
        await sleep(i * 1000);
      }

      let _event;

      let start_at: any = event.start_at;

      let date = start_at.slice(0, 10);

      event.date = date;

      if (event.sport_id == 1 && !(await Event.exists({ id: event.id }))) {
        _event = await Event.create(event);

        let _lineups: [] = [];

        let _markets: [] = [];

        getEventLineups(event.id).then((lineups) => {
          _lineups = lineups;
          getEventmarkets(event.id).then((markets) => {
            _markets = markets;
          });
        });

        _event.markets = _markets;

        _event.lineups = _lineups;

        await _event.save();
      }
    }

    console.log(`created events for ${dateToday} in db`);
  } catch (err: any) {
    console.error(err);
  }
};

const getEventmarkets = async (eventId: string) => {
  try {
    console.log("axios request - getEventMarkets");
    const options = {
      method: "GET",
      url: `https://sportscore1.p.rapidapi.com/events/${eventId}/markets`,
      headers: {
        "X-RapidAPI-Key": config.RAPID_API_KEY,
        "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
      },
    };

    await sleep(500);

    const response = await axios.request(options);

    const markets = response.data.data;

    return markets;
  } catch (error) {
    console.error(error);
  }
};

const getEventLineups = async (eventId: string) => {
  try {
    console.log("axios request -getEventLineups");
    const options = {
      method: "GET",
      url: `https://sportscore1.p.rapidapi.com/events/${eventId}/lineups`,
      headers: {
        "X-RapidAPI-Key": config.RAPID_API_KEY,
        "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
      },
    };

    await sleep(500);

    const response = await axios.request(options);

    const lineups = response.data.data;

    return lineups;
  } catch (error) {
    console.error(error);
  }
};
