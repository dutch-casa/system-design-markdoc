import { useRouter } from "next/router";
import { useState, useRef, useCallback } from "react";
import { Version, getVersionedPath } from "@/lib/versioning";

interface VersionSwitcherProps {
  versions: Version[];
  currentVersion: string | null;
}

export function VersionSwitcher({
  versions,
  currentVersion,
}: VersionSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleVersionChange = useCallback(
    (targetVersion: string) => {
      const newPath = getVersionedPath(router.asPath, targetVersion);
      router.push(newPath);
      setIsOpen(false);
    },
    [router]
  );

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClickOutside = useCallback((e: React.MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  const displayVersion = currentVersion || "latest";
  const latestVersion = versions.find((v) => v.isLatest);

  return (
    <div className="version-switcher" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="version-switcher-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="version-switcher-label">Version:</span>
        <span className="version-switcher-current">{displayVersion}</span>
        <svg
          className="version-switcher-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="version-switcher-backdrop"
            onClick={handleClickOutside}
            aria-hidden="true"
          />
          <div className="version-switcher-dropdown" role="listbox">
            {versions.map((version) => (
              <button
                key={version.tag}
                onClick={() => handleVersionChange(version.tag)}
                className={`version-switcher-option ${
                  version.tag === currentVersion
                    ? "version-switcher-option-active"
                    : ""
                }`}
                role="option"
                aria-selected={version.tag === currentVersion}
              >
                <div className="version-switcher-option-content">
                  <span className="version-switcher-option-name">
                    {version.name}
                  </span>
                  {version.isLatest && (
                    <span className="version-switcher-badge">Latest</span>
                  )}
                </div>
                <span className="version-switcher-option-date">
                  {version.date}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
