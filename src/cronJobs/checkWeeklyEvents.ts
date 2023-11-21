import { CronJob } from "cron";
import { checkWeeklyEvents } from "../services/getWeeklyEvents";

export const checkWeeklyEventsCron = new CronJob(`0 0/15 1/5 * *`, async () => {
  await checkWeeklyEvents();
});
