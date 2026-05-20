export const SCHEMAS = {
  sourcebookEntry: {
    type: "object",
    properties: {
      name: { type: "string" },
      sourceBook: { type: "string" },
      sourceId: { type: "string" },
      pageRef: { type: "string" },
    },
    required: ["name", "sourceBook", "sourceId", "pageRef"],
  },
};
