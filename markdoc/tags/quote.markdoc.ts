import { Quote } from "@/components/Quote";

export const quote = {
  render: Quote,
  children: ["paragraph", "tag", "list"],
  attributes: {
    author: {
      type: String,
    },
    source: {
      type: String,
    },
  },
};
