import { HomePage, type PublicContactView } from "@/components/home/HomePage";
import type { PackageCardView } from "@/components/home/PackageCard";
import type { PromotionView } from "@/components/home/PromotionFeature";
import { getPromotions, getPublicSettings, getTours, resolveBackendAssetUrl } from "@/lib/api";

export const revalidate = 60;

const compactText = (value: string, maxLength = 170) => {
  const plain = value.replace(/\s+/g, " ").trim();
  return plain.length <= maxLength ? plain : `${plain.slice(0, maxLength).trimEnd()}…`;
};

export default async function Page() {
  const landingRequestOptions = () => ({ signal: AbortSignal.timeout(2_500) });
  const [toursResult, promotionsResult, settingsResult] = await Promise.allSettled([
    getTours({ page: 1, limit: 6 }, landingRequestOptions()),
    getPromotions({ page: 1, limit: 6 }, landingRequestOptions()),
    getPublicSettings(landingRequestOptions()),
  ]);

  const tours: PackageCardView[] =
    toursResult.status === "fulfilled"
      ? toursResult.value.tours.map((tour) => {
          const primaryImage = tour.images.find((image) => image.isPrimary) ?? tour.images[0];
          return {
            id: tour.id,
            name: tour.name,
            summary: compactText(tour.shortDescription || tour.description),
            location: tour.location,
            duration: tour.duration,
            image: resolveBackendAssetUrl(tour.imageUrl || primaryImage?.imageUrl),
            imageAlt: primaryImage?.alt || `Vista de ${tour.name}`,
            price: tour.price,
            currency: tour.currency,
            capacity: tour.capacity,
          };
        })
      : [];

  const promotions: PromotionView[] =
    promotionsResult.status === "fulfilled"
      ? promotionsResult.value.promotions.map((promotion) => ({
          ...(() => {
            const primaryImage = promotion.images.find((image) => image.isPrimary) ?? promotion.images[0];
            return {
              image: resolveBackendAssetUrl(promotion.imageUrl || primaryImage?.imageUrl),
              imageAlt: primaryImage?.alt || `Imagen de ${promotion.title}`,
            };
          })(),
          id: promotion.id,
          title: promotion.title,
          description: promotion.description ? compactText(promotion.description, 140) : null,
          destination: promotion.destination,
          promotionalPrice: promotion.promotionalPrice,
          currency: promotion.currency,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          isFeatured: promotion.isFeatured,
        }))
      : [];

  const catalogStatus = toursResult.status === "rejected"
    ? "unavailable"
    : tours.length
      ? "ready"
      : "empty";

  const trustPublicSettings = process.env.TRUST_BACKEND_PUBLIC_SETTINGS === "true";
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value.settings : null;
  const contact: PublicContactView = trustPublicSettings && settings
    ? {
        email: settings.site_email || null,
        instagramUrl: settings.instagram_url || null,
        facebookUrl: settings.facebook_url || null,
        advisorUrl: settings.whatsapp_number
          ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
          : null,
      }
    : {
        email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
        advisorUrl: process.env.NEXT_PUBLIC_ADVISOR_URL || "https://wa.me/5214495831670",
      };

  return (
    <HomePage
      tours={tours}
      promotions={promotions}
      catalogStatus={catalogStatus}
      contact={contact}
    />
  );
}
