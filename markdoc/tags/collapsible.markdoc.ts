import { Collapsible } from "@/components/Collapsible";

export const collapsible = {
  render: Collapsible,
  children: ["paragraph", "tag", "list", "fence"],
  attributes: {
    title: {
      type: String,
      required: true,
    },
    defaultOpen: {
      type: Boolean,
      default: false,
    },
  },
};
