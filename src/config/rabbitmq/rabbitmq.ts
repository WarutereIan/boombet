import { config } from "../config";
import { Connection } from "rabbitmq-client";

const brokerUrl = config.MSG_BROKER_URL;

export const RabbitMQ = new Connection(brokerUrl);

RabbitMQ.on("error", (err) => {
  console.error("RabbitMQ connection error", err);
});

RabbitMQ.on("connection", () => {
  console.log("RabbitMQ ready");
});
