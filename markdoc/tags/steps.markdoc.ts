import { Steps } from "@/components/Steps";

export const steps = {
  render: Steps.Root,
  children: ["step"],
  attributes: {},
};

export const step = {
  render: Steps.Step,
  children: ["paragraph", "tag", "list", "fence"],
  attributes: {},
};
