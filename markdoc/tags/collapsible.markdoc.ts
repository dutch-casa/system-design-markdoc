import { Collapsible } from "@/components/Collapsible";

export const collapsible = {
  render: Collapsible,
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

