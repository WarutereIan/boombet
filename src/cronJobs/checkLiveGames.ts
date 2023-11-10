import { CronJob } from "cron";
import { checkLiveEvents } from "../services/getLiveEvents";

export const checkLiveEventsCron = new CronJob("0/2 * * * *", async () => {
  try {
    await checkLiveEvents();
  } catch (err) {
    console.error(err);
  }
});
