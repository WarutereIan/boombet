import axios from "axios";
import { Event } from "../models/Event";
import { connectDB } from "../config/db";
import { config } from "../config/config";

const date = new Date();

let day: any = date.getDate();

if (day / 10 < 1) {
  day = `0${day}`;
}
let month = date.getUTCMonth() + 1;
let year = date.getFullYear();

console.log(`${year}-${month}-${day}`); //day format with which to query api for events

let dateToday = `${year}-${month}-${day}`;

connectDB().then(() => {
  const options = {
    method: "GET",
    url: `https://sportscore1.p.rapidapi.com/sports/1/events/date/${dateToday}`,
    headers: {
      "X-RapidAPI-Key": config.RAPID_API_KEY,
      "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
    },
    data: "",
  };

  try {
    axios.request(options).then(async (res) => {
      let events: any = res.data.data;

      for (const event of events) {
        if (event.sport_id == 1) {
          await Event.create(event);
        }
      }

      console.log(`created events for ${dateToday} in db`);
    });
  } catch (err: any) {
    console.error(err.data);
  }
});
