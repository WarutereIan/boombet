import "dotenv/config";

export const config = {
  //MONGO_URI: process.env.MONGO_STRING!,

  MONGO_URI:
    "mongodb+srv://nmwanik111:8YipZNtqGJHTibOQ@cluster0.ry4udah.mongodb.net/?retryWrites=true&w=majority",

  MSG_BROKER_URL: process.env.MSG_BROKER_URL!,

  PORT: process.env.PORT,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 12, //expires in 12hours
};
