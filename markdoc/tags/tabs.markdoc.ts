import { Tabs } from "@/components/Tabs";

export const tabs = {
  render: Tabs.Root,
  attributes: {
    defaultValue: {
      type: String,
    },
  },
};

export const tab = {
  render: Tabs.Content,
  attributes: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
  },
  transform(node: any, config: any) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    
    // Generate value from label if not provided
    const value = attributes.value ?? attributes.label.toLowerCase().replace(/\s+/g, "-");
    
    return new node.constructor(
      node.type,
      { ...attributes, value },
      children
    );
  },
};

