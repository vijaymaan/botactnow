
import { TeamsActivityHandler, TurnContext } from "botbuilder";
import { handleUserQuestion } from "./rag/index";

export class ActNowBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context: TurnContext, next) => {
      const userText = (context.activity.text || "").trim();

      if (!userText) {
        await context.sendActivity("Please ask a question.");
        return;
      }

      // Optional typing indicator
      await context.sendActivity({ type: "typing" });

      try {
        const answer = await handleUserQuestion(userText);

        await context.sendActivity({
          type: "message",
          text: answer
        });
      } catch (err) {
        console.error("RAG error:", err);
        await context.sendActivity(
          "Sorry, I had trouble searching the knowledge base."
        );
      }

      await next();
    });
  }
}
