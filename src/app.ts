import {
  TeamsActivityHandler,
  TurnContext,
  CardFactory
} from "botbuilder";
import { handleUserQuestion } from "./rag/index";

/**
 * Helper to build the DL Adaptive Card
 */
function createDlCard(linkUrl: string) {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: "Distribution List",
        weight: "Bolder",
        size: "Medium"
      },
      {
        type: "TextBlock",
        text: "Click the button below to open the Distribution List page.",
        wrap: true
      }
    ],
    actions: [
      {
        type: "Action.OpenUrl",
        title: "Open DL Link",
        url: linkUrl
      }
    ]
  };
}

export class ActNowBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context: TurnContext, next) => {
      const userText = (context.activity.text || "").trim().toLowerCase();

      if (!userText) {
        await context.sendActivity("Please ask a question.");
        return;
      }

      // Optional typing indicator
      await context.sendActivity({ type: "typing" });

      try {
        /**
         * 🔹 DL LINK INTENT
         */
        if (
          userText.includes("create dl") ||
          userText.includes("dl link") ||
          userText.includes("distribution list")
        ) {
          const dlLink =
            "https://m365.cloud.microsoft/m365apps/c3ff6344-f6f0-4bfa-8697-b9d47b32ca4b/?from=PortalHome&auth=2&origindomain=microsoft365&client-request-id=c1b41081-020f-426b-a902-f9b1f19f971b";

          const card = CardFactory.adaptiveCard(
            createDlCard(dlLink)
          );

          await context.sendActivity({
            attachments: [card]
          });

          await next();
          return;
        }

        /**
         * 🔹 DEFAULT: RAG FLOW
         */
        const answer = await handleUserQuestion(userText);

        await context.sendActivity({
          type: "message",
          text: answer
        });
      } catch (err) {
        console.error("Bot error:", err);
        await context.sendActivity(
          "Sorry, I had trouble processing your request."
        );
      }

      await next();
    });
  }
}
