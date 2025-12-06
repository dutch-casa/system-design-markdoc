import { BookOpen, LucideIcon } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  links: NavLink[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Doc System Overview",
    icon: BookOpen,
    links: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/callouts", label: "Callouts" },
      { href: "/docs/code-blocks", label: "Code Blocks" },
      { href: "/docs/tabs-steps", label: "Tabs & Steps" },
      { href: "/docs/components", label: "UI Components" },
      { href: "/docs/math", label: "Math (KaTeX)" },
      { href: "/docs/diagrams", label: "Diagrams (Mermaid)" },
      { href: "/docs/adrs", label: "ADRs" },
      { href: "/docs/proofs", label: "Proofs (Lean 4)" },
    ],
  },
];

export type SearchableItem = {
  type: "page" | "heading";
  href: string;
  label: string;
  section: string;
  icon: LucideIcon;
};

export function getSearchableItems(): SearchableItem[] {
  const items: SearchableItem[] = [];

  for (const section of NAV_SECTIONS) {
    for (const link of section.links) {
      items.push({
        type: "page",
        href: link.href,
        label: link.label,
        section: section.title,
        icon: section.icon,
      });
    }
  }

  return items;
}
