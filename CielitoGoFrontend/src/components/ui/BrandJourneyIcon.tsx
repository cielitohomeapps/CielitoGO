type BrandJourneyIconProps = {
  name: "discover" | "define" | "quote";
};

/**
 * Motifs drawn for Cielito Go from the brand's compass/orientation language.
 * They intentionally do not reuse the housing iconography from Cielito Home.
 */
export function BrandJourneyIcon({ name }: BrandJourneyIconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  if (name === "discover") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="15" {...common} />
        <path d="m29.8 18.2-3.5 8.1-8.1 3.5 3.5-8.1 8.1-3.5Z" {...common} />
        <path d="M24 5v4M43 24h-4M24 43v-4M5 24h4" {...common} />
        <path d="M9.5 38.5c4.1-4.6 8.3-6.9 12.5-6.9" {...common} />
      </svg>
    );
  }

  if (name === "define") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M13 8.5h18.5L37 14v25.5H13V8.5Z" {...common} />
        <path d="M31.5 8.5V14H37M19 20h12M19 26h12" {...common} />
        <circle cx="24" cy="33" r="5.5" {...common} />
        <path d="m26 30.8-1.2 2.7-2.7 1.2 1.2-2.7 2.7-1.2Z" {...common} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M10 14.5h19l9 9v15H10v-24Z" {...common} />
      <path d="M29 14.5v9h9M17 22h8M17 27h8" {...common} />
      <path d="M17 34c2.2-3.2 4.5-4.8 7-4.8 2.3 0 4.7 1.6 7 4.8" {...common} />
      <circle cx="24" cy="34" r="3" {...common} />
    </svg>
  );
}
