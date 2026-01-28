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
            "https://myhub.avepointonlineservices.com/#/services/detail/77/074281a8-16fc-4ff0-a358-1604c334afbd";

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

if (answer && answer.trim().length > 0) {
  await context.sendActivity(answer);
} else {
  await context.sendActivity(
    "I couldn’t find an answer for that. Please try rephrasing your question."
  );
}

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
