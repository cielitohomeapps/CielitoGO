import { HomePage, type PromotionView, type PublicContactView, type TourCardView } from "@/components/home/HomePage";
import { getPromotions, getPublicSettings, getTours, resolveBackendAssetUrl } from "@/lib/api";

export const revalidate = 300;

const compactText = (value: string, maxLength = 170) => {
  const plain = value.replace(/\s+/g, " ").trim();
  return plain.length <= maxLength ? plain : `${plain.slice(0, maxLength).trimEnd()}…`;
};

export default async function Page() {
  const landingRequestOptions = () => ({ signal: AbortSignal.timeout(2_500) });
  const [toursResult, promotionsResult, settingsResult] = await Promise.allSettled([
    getTours({ page: 1, limit: 3 }, landingRequestOptions()),
    getPromotions({ page: 1, limit: 3, featured: true }, landingRequestOptions()),
    getPublicSettings(landingRequestOptions()),
  ]);

  const tours: TourCardView[] =
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
          };
        })
      : [];

  const promotions: PromotionView[] =
    promotionsResult.status === "fulfilled"
      ? promotionsResult.value.promotions.map((promotion) => ({
          id: promotion.id,
          title: promotion.title,
          description: promotion.description ? compactText(promotion.description, 140) : null,
        }))
      : [];

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
        advisorUrl: process.env.NEXT_PUBLIC_ADVISOR_URL || null,
      };

  return (
    <HomePage
      tours={tours}
      promotions={promotions}
      contact={contact}
      catalogAvailable={toursResult.status === "fulfilled"}
    />
  );
}
