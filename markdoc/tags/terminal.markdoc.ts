import { Terminal } from "@/components/Terminal";

export const terminal = {
  render: Terminal,
  attributes: {
    prompt: {
      type: String,
      default: "$",
    },
  },
};

