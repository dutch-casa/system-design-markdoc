import { CardGrid } from "@/components/CardGrid";

export const cardgrid = {
  render: CardGrid.Root,
  attributes: {
    columns: {
      type: Number,
      default: 3,
      matches: [2, 3, 4],
    },
  },
};

export const card = {
  render: CardGrid.Card,
  attributes: {
    icon: {
      type: String,
    },
    title: {
      type: String,
    },
  },
};

