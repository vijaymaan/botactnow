import {
  TeamsActivityHandler,
  TurnContext,
  CardFactory
} from "botbuilder";
import { handleUserQuestion } from "./rag/index";
import { createSharePointSiteCard } from "./cards/createSharePointSiteCard";
import { createDlCard } from "./cards/createDlCard";

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
            "https://myhub.avepointonlineservices.com/#/services/detail/77/accf435d-7875-4703-9274-3f5a5e46213c";

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
         * 🔹 Create SharePoint Site intent
         */
        if (
          userText.includes("create sharepoint site") ||
          userText.includes("new sharepoint site")
        ) {
          const spSiteLink =
            "https://your-tenant.sharepoint.com/_layouts/15/create.aspx";

          await context.sendActivity(
            CardFactory.adaptiveCard(
              createSharePointSiteCard(spSiteLink)
            )
          );

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
