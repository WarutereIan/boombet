import { WebSocket } from "ws";
import { RabbitMQ } from "../config/rabbitmq/rabbitmq";
import { wss } from "../config/sockets";

export const startStreamingServer = () => {
  const Consumer = RabbitMQ.createConsumer(
    {
      queue: "live",
      queueOptions: { durable: true },
      qos: { prefetchCount: 2 },
      exchanges: [{ exchange: "live", type: "topic" }],
      queueBindings: [
        {
          exchange: "live",
          routingKey: "live",
        },
      ],
    },
    async (msg: any) => {
      try {
        console.log("number of live matches:", msg.body.length);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg.body), { binary: false });
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  );

  Consumer.on("ready", () => {
    console.info("Boombet Live events consumer ready ");
  });
};
