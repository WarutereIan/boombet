import { leagues } from "../../tipsterLeagues";
import { connectDB } from "../config/db";
import { League } from "../models/League";

const Leagues = leagues;

let i = 0;

connectDB().then(async () => {
  for (const league of Leagues) {
    await League.create(league);
    console.log("created league", i);
    i++;
  }
});
