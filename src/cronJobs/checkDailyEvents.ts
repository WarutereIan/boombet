import { CronJob } from "cron";
import * as cron from "node-cron";

import { checkDailyEvents } from "../services/getDailyEvents";

export const checkDailyEventsCron = new CronJob("1 0/3 * * *", async () => {
  console.log("checkDailyEventsCron running");
  
  await checkDailyEvents();
});



/* export const checkDailyEventsCron = () =>
  cron.schedule("1 0/3 * * *", async () => {
    try {
      await checkDailyEvents();
    } catch (err) {
      console.error(err);
    }
  }); */
