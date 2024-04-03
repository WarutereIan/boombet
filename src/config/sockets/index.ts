import { WebSocketServer } from "ws";
import { config } from "../config";

//websockets server
export const wss = new WebSocketServer(
  {
    port: Number(config.SOCKETS_PORT),
  },
  () => {
    console.info(`Boombet Websocket server started on port ${config.SOCKETS_PORT}`);
  }
);

wss.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

wss.on("connection", (ws) => {
  ws.on("close", (code, reason) => {
    console.error(`ws closed due to ${reason} with error code ${code}`);
  });
});
