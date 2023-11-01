import { RabbitMQ } from "./rabbitmq";

export const Publisher = RabbitMQ.createPublisher({
  confirm: true,
  maxAttempts: 3,
  exchanges: [{ exchange: "live", type: "topic" }],
});
