import axios from "axios";

import { config } from "../config/config";

import { Team } from "../models/Team";

let teams;

export const createTeams = async () => {
  try {
    let pageNum = 1;
    let from: any = 1;
    let start = Date.now();

    while (from != null) {
      const options = {
        method: "GET",
        url: "https://sportscore1.p.rapidapi.com/teams",
        params: { page: pageNum },
        headers: {
          "X-RapidAPI-Key": config.RAPID_API_KEY,
          "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
        },
      };

      let response = await axios.request(options);

      console.log(response.data.meta);

      teams = response.data.data;

      for (const team of teams) {
        await Team.create(team);
      }

      from = response.data.meta.from;

      pageNum++;
    }

    let timeTaken = Date.now() - start;

    console.log("completed syncing teams in " + timeTaken / 1000 + "s");
  } catch (err) {
    console.error(err);
  }

  /* for (const team of Teams) {
    await Team.create(team);
    console.log("created team", i);
    i++;
  } */
};
