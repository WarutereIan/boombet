/**
 * Script checks the list of live matches from the API, and updates match statuses in db:
 * if event is live and its live status false, updated to true,
 * if event is not live and its live status true, updated to false
 *
 * will run every 10s
 */

import axios from "axios";
import { RedisClient, connectDB } from "../config/db";
import { Event } from "../models/Event";

import { Publisher } from "../config/rabbitmq/publishers";
import { config } from "../config/config";
import { sleep } from "../../utils/sleepFunction";
import { replaceImgUrl } from "../controllers/user/user";

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
    console.log("axios request -checkLiveEvents");
    let response = await axios(options);

    let events = response.data.data;

    let number_of_matches = 0;

    //console.log("events number:", events.length());

    //send received data to queue

    let liveList: any[] = [];

    for (const event of events) {
      let event_id = event.id;

      let storedEvent = await Event.findOne({ id: event_id });

      //update event live status
      if (storedEvent) {
        if (
          storedEvent.lineups.length == 0 &&
          storedEvent.event_lineups_checkCount < 2
        ) {
          let lineups = await getEventLineups(event_id);

          if (lineups != null || undefined) storedEvent.lineups = lineups;

          storedEvent.event_lineups_checkCount++;
        }

        storedEvent.status = event.status;
        storedEvent.status_more = event.status_more;
        storedEvent.winner_code = event.winner_code;
        storedEvent.cards_code = event.cards_code;
        storedEvent.event_data_change = event.event_data_change;
        storedEvent.lasted_period = event.lasted_period;
        storedEvent.main_odds = event.main_odds;
        storedEvent.live = true;
        storedEvent.home_score = event.home_score;
        storedEvent.away_score = event.away_score;
        storedEvent.time_details = event.time_details;

        //TBD: Whether to use socket subscriptions for the matches: NO, no need
        await storedEvent.save();
      } else {
        await Event.create(event);
        console.log(`created event ${event_id}`);
      }

      /* event.incidents = incidents; */

      liveList.push(event_id);
    }

    let dbLiveMatches = await Event.find({ live: true });

    let trueLiveEvents: any = {};

    let prediction_changed: any[] = [];
    let prediction_not_changed: any[] = [];

    for (const match of dbLiveMatches) {
      //update event live status to false if ended
      if (!liveList.includes(match.id)) {
        let falseMatch = await Event.findOne({ id: match.id }).select("live");
        if (falseMatch) {
          falseMatch.live = false;

          await falseMatch.save();

          console.log(
            `Match id ${match.id} finished and live status updated to False
          `
          );
        }
      } else {
        for (let i = 0; i < 2; i++) {
          await sleep(i * 200);
        }

        match.incidents = await getEventIncidents(match.id);
        match.stats = await getEventStats(match.id);

        replaceImgUrl(match);

        await match.save();

        if (match.prediction_changed) {
          prediction_changed.push(match);
          number_of_matches++;
        } else {
          prediction_not_changed.push(match);
          number_of_matches++;
        }
      }

      //sort true live events into this with admin predictions and those without
      //odds_modified, and odds_not_modified
    }

    trueLiveEvents.prediction_changed = prediction_changed;
    trueLiveEvents.prediction_not_changed = prediction_not_changed;
    //insert into cache list of live matches
    //users will fetch list of live matches from cache
    //will need to define a schema with only the relevant details at some point
    await RedisClient.set(
      "LiveMatches",
      JSON.stringify({
        number_of_matches: trueLiveEvents.length,
        matches: trueLiveEvents,
      })
    );

    await Publisher.send(
      {
        exchange: "live",
        routingKey: "live",
      },
      trueLiveEvents
    );

    console.log(`number of live matches: ${number_of_matches}`);

    console.log(`finished updating live matches
     `);
  } catch (err: any) {
    console.error(`check live events error`, err);
  }

  //also store live matches stats in cache after this update, as array so users get them:
  //refresh this after every get request for live matches
};

async function getEventIncidents(eventId: string) {
  try {
    console.log("axios request - getEventIncidents");

    const options = {
      method: "GET",
      url: `https://sportscore1.p.rapidapi.com/events/${eventId}/incidents`,
      headers: {
        "X-RapidAPI-Key": config.RAPID_API_KEY,
        "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);

    const incidents = response.data.data;

    return incidents;
  } catch (error) {
    console.error(error);
  }
}

async function getEventStats(eventId: string) {
  try {
    console.log("axios request -getEventStats");

    const options = {
      method: "GET",
      url: `https://sportscore1.p.rapidapi.com/events/${eventId}/statistics`,
      headers: {
        "X-RapidAPI-Key": config.RAPID_API_KEY,
        "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
      },
    };

    let response = await axios.request(options);

    let stats = response.data.data;

    return stats;
  } catch (error) {
    console.error(error);
  }
}

async function getEventLineups(eventId: string) {
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
}
//for each event: user should be able to subscribe/view the events details?: ws

//push live events' data to queue, have consumer stream to clients
