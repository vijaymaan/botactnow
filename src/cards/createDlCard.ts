export function createDlCard(linkUrl: string) {
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
        url: linkUrl   // ✅ dynamic
      }
    ]
  };
}
