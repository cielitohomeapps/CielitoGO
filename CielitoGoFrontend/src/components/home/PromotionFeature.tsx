import Image from "next/image";

export type PromotionView = {
  id: string;
  title: string;
  description?: string | null;
  destination?: string | null;
  promotionalPrice?: string | number | null;
  currency: string;
  startDate?: string | null;
  endDate?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  isFeatured: boolean;
};

function formatPromotionPrice(value: string | number | null | undefined, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  try {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount.toLocaleString("es-MX")} ${currency}`;
  }
}

function isLoopbackImage(url: string) {
  try { return ["localhost", "127.0.0.1", "::1"].includes(new URL(url).hostname); }
  catch { return false; }
}

export function PromotionFeature({ promotion }: { promotion: PromotionView }) {
  const price = formatPromotionPrice(promotion.promotionalPrice, promotion.currency);
  return (
    <article className={`promotion-feature${promotion.image ? " promotion-feature--image" : ""}`}>
      <div className="promotion-feature__content">
        <p className="eyebrow eyebrow--light">{promotion.isFeatured ? "Promoción destacada" : "Promoción vigente"}</p>
        <h3>{promotion.title}</h3>
        {promotion.description ? <p>{promotion.description}</p> : null}
        <div className="promotion-feature__meta">
          {promotion.destination ? <span>{promotion.destination}</span> : null}
          {price ? <strong>Desde {price} <small>{promotion.currency}</small></strong> : null}
        </div>
        <a className="button button--accent" href="#cotizar" aria-label={`Solicitar la promoción ${promotion.title}`}>Solicitar promoción</a>
      </div>
      {promotion.image ? (
        <div className="promotion-feature__media">
          <Image src={promotion.image} alt={promotion.imageAlt || `Imagen de ${promotion.title}`} fill sizes="(max-width: 767px) 100vw, 42vw" unoptimized={isLoopbackImage(promotion.image)} />
        </div>
      ) : <div className="promotion-feature__mark" aria-hidden="true">Cielito Go</div>}
    </article>
  );
}
