export function createSharePointSiteCard(siteUrl: string) {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: "Create SharePoint Site",
        weight: "Bolder",
        size: "Medium"
      },
      {
        type: "TextBlock",
        text:
          "Click the button below to create a new SharePoint site.",
        wrap: true
      }
    ],
    actions: [
      {
        type: "Action.OpenUrl",
        title: "Create Site",
        url: siteUrl
      }
    ]
  };
}
