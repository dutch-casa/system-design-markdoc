import { Quote } from "@/components/Quote";

export const quote = {
  render: Quote,
  attributes: {
    author: {
      type: String,
    },
    source: {
      type: String,
    },
  },
};

