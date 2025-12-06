import { Glossary } from "@/components/Glossary";

export const glossary = {
  render: Glossary,
  attributes: {
    term: {
      type: String,
      required: true,
    },
  },
};

