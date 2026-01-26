import "dotenv/config";
import restify from "restify";
import { BotFrameworkAdapter } from "botbuilder";
import { ActNowBot } from "./app";

/**
 * Create Bot Framework adapter
 */
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
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

server.post("/api/messages", async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});

/**
 * Start server (Azure-safe)
 */
const port = parseInt(process.env.PORT ?? "8080", 10);

server.listen(port, "0.0.0.0", () => {
  console.log(`Bot running on port ${port}`);
});
