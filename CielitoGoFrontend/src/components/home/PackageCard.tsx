import Image from "next/image";

import { BrandJourneyIcon } from "@/components/ui/BrandJourneyIcon";

export type PackageCardView = {
  id: string;
  name: string;
  summary: string;
  location?: string | null;
  duration?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  price: string | number;
  currency: string;
  capacity?: number | null;
};

function formatPrice(value: string | number, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("es-MX")} ${currency}`;
  }
}

function isLoopbackImage(url: string) {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function PackageCard({ item }: { item: PackageCardView }) {
  const price = formatPrice(item.price, item.currency);

  return (
    <article className="package-card">
      <div className="package-card__media">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageAlt || `Vista de ${item.name}`}
            fill
            sizes="(max-width: 699px) 100vw, (max-width: 1099px) 50vw, 33vw"
            unoptimized={isLoopbackImage(item.image)}
          />
        ) : (
          <div className="package-card__placeholder" role="img" aria-label={`Imagen pendiente para ${item.name}`}>
            <BrandJourneyIcon name="discover" />
            <span>Imagen en preparación</span>
          </div>
        )}
        {item.location ? <span className="package-card__location">{item.location}</span> : null}
      </div>
      <div className="package-card__content">
        <p className="eyebrow">Paquete disponible</p>
        <h3>{item.name}</h3>
        <p>{item.summary}</p>
        <dl className="package-card__facts">
          {item.duration ? <><dt>Duración</dt><dd>{item.duration}</dd></> : null}
          {typeof item.capacity === "number" ? <><dt>Capacidad</dt><dd>Hasta {item.capacity} viajeros</dd></> : null}
        </dl>
        <div className="package-card__footer">
          {price ? <p><span>Desde</span><strong>{price}</strong><small>{item.currency}</small></p> : <span />}
          <a href="#cotizar" aria-label={`Cotizar el paquete ${item.name}`}>Cotizar paquete <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </article>
  );
}
