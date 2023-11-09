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

      let incidents = await getEventIncidents(event.id);
      let stats = await getEventStats(event_id);

      let storedEvent = await Event.findOne({ id: event_id });

      //update event live status to true
      if (storedEvent && !storedEvent.live) {
        storedEvent.status = event.status;
        storedEvent.status_more = event.status_more;
        storedEvent.winner_code = event.winner_code;
        storedEvent.cards_code = event.cards_code;
        storedEvent.event_data_change = event.event_data_change;
        storedEvent.lasted_period = event.lasted_period;
        storedEvent.main_odds = event.main_odds;
        storedEvent.live = true;
        storedEvent.incidents = incidents;
        storedEvent.stats = stats;
        //TBD: Whether to use socket subscriptions for the matches: NO, no need
        await storedEvent.save();

        console.log(`Updated event ${event_id} live status to True`);
      }

      event.incidents = incidents;

      liveList.push(event_id);
    }

    await Publisher.send(
      {
        exchange: "live",
        routingKey: "live",
      },
      events
    );

    let dbLiveMatches = await Event.find({ live: true });

    let trueLiveEvents: any[] = [];

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
        let incidents = await getEventIncidents(match.id);
        let stats = await getEventStats(match.id);

        match.incidents = incidents;
        match.stats = stats;
        await match.save();

        trueLiveEvents.push(match);
      }
    }

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

    console.log(`finished updating live matches
     `);
  } catch (err) {
    console.error(err);
  }

  //also store live matches stats in cache after this update, as array so users get them:
  //refresh this after every get request for live matches
};

const getEventIncidents = async (eventId: string) => {
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
};

const getEventStats = async (eventId: string) => {
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
};
//for each event: user should be able to subscribe/view the events details?: ws

//push live events' data to queue, have consumer stream to clients

//
