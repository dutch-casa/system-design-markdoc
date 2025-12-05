import { ADR } from "../../components/ADR";

export const adr = {
  render: ADR,
  description: "Architecture Decision Record",
  children: ["paragraph", "list", "fence", "blockquote"],
  attributes: {
    id: {
      type: String,
      required: true,
      description: "ADR identifier/number (e.g., '001', '042')",
    },
    title: {
      type: String,
      required: true,
      description:
        "Short title describing the decision (e.g., 'Use PostgreSQL for User Data')",
    },
    status: {
      type: String,
      required: true,
      description:
        "Decision status: proposed | accepted | deprecated | superseded | rejected",
      matches: ["proposed", "accepted", "deprecated", "superseded", "rejected"],
    },
    date: {
      type: String,
      required: true,
      description:
        "Date of decision (e.g., '2024-01-15' or 'January 15, 2024')",
    },
    deciders: {
      type: String,
      description: "People who made the decision (comma-separated)",
    },
    supersedes: {
      type: String,
      description: "ADR ID that this decision supersedes",
    },
    supersededBy: {
      type: String,
      description: "ADR ID that supersedes this decision",
    },
  },
};
