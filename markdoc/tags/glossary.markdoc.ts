import { Glossary } from "@/components/Glossary";

export const glossary = {
  render: Glossary,
  children: ["paragraph", "tag", "list"],
  attributes: {
    term: {
      type: String,
      required: true,
    },
  },
};
