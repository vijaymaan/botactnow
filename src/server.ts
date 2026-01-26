import "dotenv/config";
import restify from "restify";
import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication
} from "botbuilder";
import { ActNowBot } from "./app";

/**
 * Bot Framework Authentication (MODERN)
 */
const botFrameworkAuthentication =
  new ConfigurationBotFrameworkAuthentication({
    MicrosoftAppType: process.env.MicrosoftAppType || "SingleTenant",
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
  });

/**
 * Adapter
 */
const adapter = new CloudAdapter(botFrameworkAuthentication);

/**
 * Error handling
 */
adapter.onTurnError = async (context, error) => {
  console.error("Bot error:", error);
  await context.sendActivity("The bot encountered an error.");
};

/**
 * Bot
 */
const bot = new ActNowBot();

/**
 * Server
 */
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await bot.run(context);
  });
});

/**
 * Azure-safe port
 */
const port = parseInt(process.env.PORT ?? "8080", 10);

server.listen(port, "0.0.0.0", () => {
  console.log(`Bot running on port ${port}`);
});
