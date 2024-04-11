import { AdminBookie } from "../models/AdminBookie";
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

    //list of admin bookies
    let adminBookies = await AdminBookie.find();

    if (adminBookies) {
      await RedisClient.set("adminBookies", JSON.stringify(adminBookies));
      console.info("Set admin bookies list in cache");
    } else {
      throw new Error("Could not fetch admin bookies at startup");
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
