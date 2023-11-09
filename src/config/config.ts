import "dotenv/config";

export const config = {
  MONGO_URI: process.env.MONGO_STRING!,

  MSG_BROKER_URL: process.env.MSG_BROKER_URL!,

  PORT: process.env.PORT,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 12, //expires in 12hours

  RAPID_API_KEY: process.env.RAPID_API_KEY,

  BET_CONVERTER_API_KEY: process.env.BET_CONVERTER_API_KEY,

  BET_CONVERTER_BASE_URL: "https://convertbetcodes.com/api",
};
