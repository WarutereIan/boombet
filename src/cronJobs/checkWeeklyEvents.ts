import { CronJob } from "cron";

import * as cron from "node-cron";

import { checkWeeklyEvents } from "../services/getWeeklyEvents";

/* export const checkWeeklyEventsCron = new CronJob(`0 0/15 1/5 * *`, async () => {
  await checkWeeklyEvents();
}); */

export const checkWeeklyEventsCron = () => {
  cron.schedule("0 0 */3 * *", async () => {
    try {
      await checkWeeklyEvents();
    } catch (err) {
      console.error(err);
    }
  });
};
