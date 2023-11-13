import axios from "axios";
import { config } from "../config/config";
import { League } from "../models/League";

let leagues;

export const getLeagues = async () => {
  try {
    let pageNum = 1;
    let from: any = 1;
    let start = Date.now();

    while (from != null) {

      
      const options = {
        method: "GET",
        url: "https://sportscore1.p.rapidapi.com/leagues",
        params: { page: pageNum },

        headers: {
          "X-RapidAPI-Key": config.RAPID_API_KEY,
          "X-RapidAPI-Host": "sportscore1.p.rapidapi.com",
        },
      };

      let response = await axios(options);

      leagues = response.data.data;

      for (const league of leagues) {
        if (league.sport_id == 1 && !(await League.exists({ id: league.id }))) {
          await League.create(league);
        } else {
          
        }
      }

      from = response.data.meta.from;

      pageNum++;
    }

    let timeTaken = Date.now() - start;

    console.log("completed syncing leagues in " + timeTaken / 1000 + "s");
  } catch (error) {
    console.error(error);
  }
};
