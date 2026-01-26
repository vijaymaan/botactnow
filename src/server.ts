import dotenv from "dotenv";
dotenv.config();
import restify from "restify";
import { BotFrameworkAdapter } from "botbuilder";
import { ActNowBot } from "./app";

/**
 * Create Bot Framework adapter
 */
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

/**
 * Global error handler
 */
adapter.onTurnError = async (context, error) => {
  console.error("Bot error:", error);
  await context.sendActivity("The bot encountered an error.");
};

/**
 * Create bot instance
 */
const bot = new ActNowBot();

/**
 * Create Restify server
 */
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.post("/api/messages", (req: any, res: any, next: any) => {
  adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
  return next();
});

/**
 * Start server
 */
const port = Number(process.env.PORT || 3978);
server.listen(port, () => {
  console.log(`Bot running at http://localhost:${port}`);
});
