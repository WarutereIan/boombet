/**
 * Script checks the list of live matches from the API, and updates match statuses in db:
 * if event is live and its live status false, updated to true,
 * if event is not live and its live status true, updated to false
 *
 * will run every 10s
 */

import axios from "axios";
import { connectDB } from "../config/db";
import { Event } from "../models/Event";
import { time } from "cron";
import { Publisher } from "../config/rabbitmq/publishers";
import { config } from "../config/config";

const options = {
  method: "GET",
  url: "https://sportscore1.p.rapidapi.com/sports/1/events/live",
  headers: {
    "X-RapidAPI-Key": config.RAPID_API_KEY,
    "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
  },
};

export const checkLiveEvents = async () => {
  try {
    let response = await axios(options);

    let events = response.data.data;

    //send received data to queue

    let liveList: any[] = [];

    for (const event of events) {
      let event_id = event.id;

      let storedEvent = await Event.findOne({ id: event_id });

      if (storedEvent && !storedEvent.live) {
        storedEvent.live = true;
        //TBD: Whether to use socket subscriptions for the matches
        await storedEvent.save();

        console.log(`Updated event ${event_id} status to True`);
      }

      liveList.push(event_id);
    }

    await Publisher.send(
      {
        exchange: "live",
        routingKey: "live",
      },
      events
    );

    let dbLiveMatches = await Event.find({ live: true }).select("id");
    let dbLiveMatchesId: any[] = [];

    for (const match of dbLiveMatches) {
      dbLiveMatchesId.push(match.id);
    }

    for (const match of dbLiveMatchesId) {
      if (!liveList.includes(match)) {
        let falseMatch = await Event.findOne({ id: match }).select("live");
        if (falseMatch) {
          falseMatch.live = false;

          await falseMatch.save();

          console.log(
            `Match id ${match} finished and live status updated to False
          `
          );
        }
      }
    }

    console.log(`finished updating live matches
     `);
  } catch (err) {
    console.error(err);
  }

  //also store live matches stats in cache after this update, as array so users get them:
  //refresh this after every get request for live matches
};

let start = Date.now();

//for each event: user should be able to subscribe/view the events details?: ws

//push live events' data to queue, have consumer stream to clients

//
