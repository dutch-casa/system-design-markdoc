import Link from "next/link";
import { BacklinkEntry } from "@/lib/backlinks";

interface BacklinksProps {
  backlinks: BacklinkEntry[];
}

export function Backlinks({ backlinks }: BacklinksProps) {
  if (backlinks.length === 0) return null;

  const markdownBacklinks = backlinks.filter((b) => b.linkType === "markdown");
  const mermaidBacklinks = backlinks.filter((b) => b.linkType === "mermaid");

  return (
    <div className="backlinks-section">
      <h2 className="backlinks-title">Referenced by</h2>
      <p className="backlinks-description">
        Pages that link to this document ({backlinks.length} total)
      </p>

      {markdownBacklinks.length > 0 && (
        <div className="backlinks-group">
          <h3 className="backlinks-group-title">Markdown Links</h3>
          <ul className="backlinks-list">
            {markdownBacklinks.map((backlink) => (
              <li key={backlink.sourcePath} className="backlinks-item">
                <Link
                  href={backlink.sourcePath}
                  className="backlinks-link"
                  data-type="markdown"
                >
                  {backlink.sourceTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mermaidBacklinks.length > 0 && (
        <div className="backlinks-group">
          <h3 className="backlinks-group-title">Diagram Links</h3>
          <ul className="backlinks-list">
            {mermaidBacklinks.map((backlink) => (
              <li key={backlink.sourcePath} className="backlinks-item">
                <Link
                  href={backlink.sourcePath}
                  className="backlinks-link"
                  data-type="mermaid"
                >
                  {backlink.sourceTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
