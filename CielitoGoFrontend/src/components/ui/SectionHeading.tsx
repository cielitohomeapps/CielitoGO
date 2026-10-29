type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  id?: string;
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  id,
  inverse = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`section-heading section-heading--${align}${inverse ? " section-heading--inverse" : ""}`}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {body ? <p className="section-heading__body">{body}</p> : null}
    </div>
  );
}
