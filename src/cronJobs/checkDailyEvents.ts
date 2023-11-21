import { CronJob } from "cron";
import { checkDailyEvents } from "../services/getDailyEvents";

export const checkDailyEventsCron = new CronJob("1 0/3 * * *", async () => {
  await checkDailyEvents();
});
