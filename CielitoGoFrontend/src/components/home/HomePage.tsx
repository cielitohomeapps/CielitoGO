import Image from "next/image";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { PackageCard, type PackageCardView } from "@/components/home/PackageCard";
import { PromotionFeature, type PromotionView } from "@/components/home/PromotionFeature";
import { BackendWakeUp } from "@/components/home/BackendWakeUp";
import { Reveal } from "@/components/ui/Reveal";
import { BrandJourneyIcon } from "@/components/ui/BrandJourneyIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  featuredDestinations,
  experienceCategories,
  functionalCopy,
  planningBenefits,
  siteContent,
} from "@/content/es";

export type PublicContactView = {
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  advisorUrl?: string | null;
};

type HomePageProps = {
  tours: PackageCardView[];
  promotions: PromotionView[];
  catalogStatus: "ready" | "empty" | "unavailable";
  contact: PublicContactView;
};

function isLoopbackImage(url: string | null | undefined) {
  if (!url) return false;
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function HomePage({ tours, promotions, catalogStatus, contact }: HomePageProps) {
  const quoteDestinations = Array.from(
    new Set([
      ...tours.map((tour) => tour.location || tour.name),
      ...featuredDestinations.map((destination) => destination.name),
    ]),
  );

  return (
    <>
      <a className="skip-link" href="#main-content">{functionalCopy.skipToContent}</a>
      <Header />

      <main id="main-content">
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <Image
            src="/images/travel/hero-lagoon.png"
            alt="Laguna tranquila entre acantilados bañados por luz cálida"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="hero__image"
          />
          <div className="hero__overlay" />
          <div className="hero__content shell">
            <p className="eyebrow eyebrow--light">{siteContent.hero.eyebrow}</p>
            <h1 id="hero-title">{siteContent.hero.title}</h1>
            <p>{siteContent.hero.body}</p>
            <div className="hero__actions">
              <a className="button button--accent" href="#destinos">{siteContent.hero.primaryCta}</a>
              <a className="button button--ghost-light" href="#cotizar">{siteContent.hero.secondaryCta}</a>
            </div>
          </div>
          <a className="hero__scroll" href="#destinos" aria-label="Ir a destinos">
            <span>Explorar</span>
            <span aria-hidden="true">↓</span>
          </a>
        </section>

        <section id="destinos" className="section section--ivory" aria-labelledby="destinations-title">
          <div className="shell">
            <Reveal>
              <div className="section-intro section-intro--split">
                <SectionHeading
                  id="destinations-title"
                  eyebrow={siteContent.destinations.eyebrow}
                  title={siteContent.destinations.title}
                  body={siteContent.destinations.body}
                />
                <a className="text-link" href="#paquetes">{siteContent.destinations.cta}<span aria-hidden="true">→</span></a>
              </div>
            </Reveal>

            <div className="destination-grid" aria-label="Destinos para viajar">
              {featuredDestinations.map((destination, index) => (
                <Reveal
                  as="article"
                  className={`destination-card destination-card--${destination.layout}`}
                  delay={index * 90}
                  key={destination.id}
                >
                  <Image
                    src={destination.image}
                    alt={destination.alt}
                    fill
                    sizes={destination.layout === "portrait" ? "(max-width: 767px) 100vw, 34vw" : "(max-width: 767px) 100vw, 66vw"}
                    className="destination-card__image"
                  />
                  <div className="destination-card__scrim" />
                  <div className="destination-card__content">
                    <h3>{destination.name}</h3>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </section>

        <section id="paquetes" className="section section--packages" aria-labelledby="packages-title">
          <div className="shell">
            <Reveal>
              <SectionHeading
                id="packages-title"
                eyebrow={siteContent.packages.eyebrow}
                title={siteContent.packages.title}
                body={siteContent.packages.body}
              />
            </Reveal>

            {promotions.length ? <Reveal><PromotionFeature promotion={promotions[0]} /></Reveal> : null}

            <BackendWakeUp visible={catalogStatus === "unavailable"} />

            {catalogStatus === "ready" ? (
              <div className="package-grid" aria-label="Paquetes de viaje disponibles">
                {tours.map((tour, index) => (
                  <Reveal delay={index * 70} key={tour.id}>
                    <PackageCard item={tour} />
                  </Reveal>
                ))}
              </div>
            ) : catalogStatus === "empty" ? (
              <Reveal className="catalog-state">
                <BrandJourneyIcon name="discover" />
                <div>
                  <h3>{siteContent.packages.emptyTitle}</h3>
                  <p>{siteContent.packages.emptyBody}</p>
                </div>
                <a className="button button--outline" href="#cotizar">Solicitar una propuesta</a>
              </Reveal>
            ) : null}
          </div>
        </section>

        <section id="experiencias" className="section section--sand" aria-labelledby="experiences-title">
          <div className="shell">
            <Reveal>
              <SectionHeading
                id="experiences-title"
                eyebrow={siteContent.experiences.eyebrow}
                title={siteContent.experiences.title}
                body={siteContent.experiences.body}
                align="center"
              />
            </Reveal>

            {tours.length ? (
              <div className="experience-grid" aria-label="Experiencias disponibles">
                {tours.slice(0, 3).map((tour, index) => (
                  <Reveal as="article" className="experience-card" delay={index * 80} key={tour.id}>
                    <div className="experience-card__media">
                      <Image
                        src={tour.image || experienceCategories[index % experienceCategories.length].image}
                        alt={tour.image ? `Vista de ${tour.name}` : experienceCategories[index % experienceCategories.length].alt}
                        fill
                        sizes="(max-width: 767px) 100vw, 33vw"
                        unoptimized={isLoopbackImage(tour.image)}
                      />
                    </div>
                    <div className="experience-card__content">
                      <p className="eyebrow">Catálogo confirmado por la API</p>
                      <h3>{tour.name}</h3>
                      <p>{tour.summary}</p>
                      <dl className="experience-card__facts">
                        {tour.location ? <><dt>Destino</dt><dd>{tour.location}</dd></> : null}
                        {tour.duration ? <><dt>Duración</dt><dd>{tour.duration}</dd></> : null}
                      </dl>
                      <a className="text-link" href="#cotizar">Solicitar cotización <span aria-hidden="true">→</span></a>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="experience-grid" aria-label="Experiencias para cada estilo de viaje">
                {experienceCategories.map((experience, index) => (
                  <Reveal as="article" className="experience-card" delay={index * 80} key={experience.title}>
                    <div className="experience-card__media">
                      <Image src={experience.image} alt={experience.alt} fill sizes="(max-width: 767px) 100vw, 33vw" />
                    </div>
                    <div className="experience-card__content">
                      <h3>{experience.title}</h3>
                      <p>{experience.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

          </div>
        </section>

        <section id="servicios" className="section section--ivory service-section" aria-labelledby="services-title">
          <div className="shell">
            <div className="service-story">
              <Reveal className="service-story__media">
                <Image
                  src="/images/travel/coastal-evening.png"
                  alt="Costa tranquila con arquitectura histórica y luz cálida"
                  fill
                  sizes="(max-width: 767px) 100vw, 46vw"
                />
              </Reveal>
              <Reveal className="service-story__content" delay={90}>
                <SectionHeading
                  id="services-title"
                  eyebrow={siteContent.services.eyebrow}
                  title={siteContent.services.title}
                  body={siteContent.services.body}
                />
                <a className="button button--outline" href="#cotizar">{siteContent.services.cta}</a>
              </Reveal>
            </div>

            <div className="benefit-grid">
              {planningBenefits.map((benefit, index) => (
                <Reveal as="article" className="benefit-card" delay={index * 70} key={benefit.title}>
                  <span className="benefit-card__icon" aria-hidden="true">
                    <BrandJourneyIcon name={benefit.icon} />
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="historias" className="section stories" aria-labelledby="stories-title">
          <div className="stories__decor" aria-hidden="true">“</div>
          <div className="shell stories__inner">
            <Reveal>
              <SectionHeading
                id="stories-title"
                eyebrow={siteContent.stories.eyebrow}
                title={siteContent.stories.title}
                body={siteContent.stories.body}
                align="center"
                inverse
              />
            </Reveal>
            <Reveal className="stories__pending" delay={100}>
              <Image src="/images/figma/quote-mark.svg" width={42} height={36} alt="" />
              <h3>{siteContent.stories.pendingTitle}</h3>
              <p>{siteContent.stories.pendingBody}</p>
            </Reveal>
          </div>
        </section>

        <section id="cotizar" className="section section--ivory conversion" aria-labelledby="conversion-title">
          <div className="shell conversion__layout">
            <Reveal className="conversion__intro">
              <SectionHeading
                id="conversion-title"
                eyebrow={siteContent.conversion.eyebrow}
                title={siteContent.conversion.title}
                body={siteContent.conversion.body}
              />
              {contact.advisorUrl ? (
                <a className="button button--outline" href={contact.advisorUrl} target="_blank" rel="noreferrer" aria-label={`${siteContent.conversion.secondaryCta} (se abre en otra pestaña)`}>
                  {siteContent.conversion.secondaryCta}
                </a>
              ) : (
                <p className="contact-pending">El canal directo de asesoría se mostrará cuando esté confirmado por la configuración pública.</p>
              )}
            </Reveal>
            <Reveal className="conversion__form" delay={100}>
              <QuoteForm destinationOptions={quoteDestinations} advisorUrl={contact.advisorUrl} />
            </Reveal>
          </div>
        </section>
      </main>

      <Footer email={contact.email} instagramUrl={contact.instagramUrl} facebookUrl={contact.facebookUrl} />
    </>
  );
}
