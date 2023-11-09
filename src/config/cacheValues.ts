import { Bookie } from "../models/Bookie";
import { RedisClient } from "./db";

/**
 * stores:
 *  list of bookies
 */
export const storeCacheValues = async () => {
  try {
    //list of bookies
    let bookies = await Bookie.find();

    if (bookies) {
      await RedisClient.set("bookies", JSON.stringify(bookies));
      console.info("Set bookies list in cache");
    } else {
      throw new Error("Could not fetch bookies at startup");
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
