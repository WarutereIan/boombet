import { CronJob } from "cron";
import { checkDailyEvents } from "../services/getDailyEvents";

export const checkDailyEventsCron = new CronJob("0/40 0/3 * * *", async () => {
  await checkDailyEvents();
});
