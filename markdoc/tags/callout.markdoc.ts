import { Callout } from "@/components/Callout";

export const callout = {
  render: Callout,
  children: ["paragraph", "tag", "list"],
  attributes: {
    type: {
      type: String,
      default: "note",
      matches: ["note", "warning", "error", "tip"],
      description: "Callout type: note | warning | error | tip",
    },
    title: {
      type: String,
      description: "Optional title (defaults based on type)",
    },
  },
};
