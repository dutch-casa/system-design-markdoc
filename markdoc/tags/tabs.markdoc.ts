import { Tabs } from "@/components/Tabs";

export const tabs = {
  render: Tabs, // Use the default composed component
  children: ["tab"],
  attributes: {},
};

export const tab = {
  render: Tabs.Content,
  children: ["paragraph", "tag", "list", "fence"],
  attributes: {
    label: {
      type: String,
      required: true,
    },
  },
};
