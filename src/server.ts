//http server
import express from "express";

import { connectDB } from "./config/db";
import { configureMiddleware } from "./middlewares/config";
import { configureRoutes } from "./routes";
import { createServer } from "http";
import { config } from "./config/config";
import { startStreamingServer } from "./sockets/server";
import { checkLiveEventsCron } from "./cronJobs/checkLiveGames";
import { createTeams } from "./scripts/createTeams";
import { checkDailyEvents } from "./services/getDailyEvents";
import { createBookies } from "./scripts/createBookies";
import { storeCacheValues } from "./config/cacheValues";
import { getLeagues } from "./services/getLeagues";
import { checkDailyEventsCron } from "./cronJobs/checkDailyEvents";
import { checkWeeklyEventsCron } from "./cronJobs/checkWeeklyEvents";
import { checkWeeklyEvents } from "./services/getWeeklyEvents";

let db: any;

(async () => {
  db = connectDB().then();
})();

//initialize express app
const app = express();

//configure Express middleware
configureMiddleware(app);

//setup routes
configureRoutes(app);

//start server and listen for connections
const httpServer = createServer(app);

httpServer.listen(config.PORT || 9000, () => {
  console.info(
    `boombet /api/v1 Server started on`,
    httpServer.address(),
    `PID ${process.pid} \n`
  );
});

startStreamingServer();
checkDailyEvents();
checkWeeklyEvents();
checkWeeklyEventsCron();
checkDailyEventsCron();
checkLiveEventsCron.start();

//createTeams().then();
storeCacheValues().then();

//getLeagues().then();
