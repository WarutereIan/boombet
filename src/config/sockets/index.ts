import { WebSocketServer } from "ws";

//websockets server
export const wss = new WebSocketServer(
  {
    port: 9001,
  },
  () => {
    console.info("Boombet Websocket server started on port 9001");
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
