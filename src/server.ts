//http server
import express from "express";

import { connectDB } from "./config/db";
import { configureMiddleware } from "./middlewares/config";
import { configureRoutes } from "./routes";
import { createServer } from "http";
import { config } from "./config/config";
import { startStreamingServer } from "./sockets/server";
import { checkLiveEventsCron } from "./cronJobs/checkLiveGames";

let db: any;

(async () => {
  db = await connectDB();
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
checkLiveEventsCron.start();
