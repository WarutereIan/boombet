import { bookies } from "../../bookies";
import { Bookie } from "../models/Bookie";

const Bookies = bookies;

export const createBookies = async () => {
  try {
    for (const bookie of Bookies) {
      await Bookie.create(bookie);
    }

    console.log("created bookies");
  } catch (err) {
    console.error(err);
  }
};
