import Image from "next/image";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  editorialDestinations,
  experienceCategories,
  functionalCopy,
  planningBenefits,
  siteContent,
} from "@/content/es";

export type TourCardView = {
  id: string;
  name: string;
  summary: string;
  location?: string | null;
  duration?: string | null;
  image?: string | null;
};

export type PromotionView = {
  id: string;
  title: string;
  description?: string | null;
};

export type PublicContactView = {
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  advisorUrl?: string | null;
};

type HomePageProps = {
  tours: TourCardView[];
  promotions: PromotionView[];
  contact: PublicContactView;
  catalogAvailable: boolean;
};

export function HomePage({ tours, promotions, contact, catalogAvailable }: HomePageProps) {
  const quoteDestinations = Array.from(
    new Set([
      ...tours.map((tour) => tour.location || tour.name),
      ...editorialDestinations.map((destination) => `${destination.name}, ${destination.country}`),
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
                <a className="text-link" href="#experiencias">{siteContent.destinations.cta}<span aria-hidden="true">→</span></a>
              </div>
            </Reveal>

            <div className="destination-grid" aria-label="Destinos de inspiración editorial">
              {editorialDestinations.map((destination, index) => (
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
                  <p className="destination-card__status">{siteContent.destinations.provisionalLabel}</p>
                  <div className="destination-card__content">
                    <p>{destination.country}</p>
                    <h3>{destination.name}</h3>
                  </div>
                </Reveal>
              ))}
            </div>

            {promotions.length ? (
              <Reveal className="verified-strip">
                <p className="eyebrow">Información vigente desde la API</p>
                <div className="verified-strip__items">
                  {promotions.slice(0, 3).map((promotion) => (
                    <article key={promotion.id}>
                      <h3>{promotion.title}</h3>
                      {promotion.description ? <p>{promotion.description}</p> : null}
                    </article>
                  ))}
                </div>
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
              <div className="experience-grid" aria-label="Categorías editoriales provisionales">
                {experienceCategories.map((experience, index) => (
                  <Reveal as="article" className="experience-card" delay={index * 80} key={experience.title}>
                    <div className="experience-card__media">
                      <Image src={experience.image} alt={experience.alt} fill sizes="(max-width: 767px) 100vw, 33vw" />
                    </div>
                    <div className="experience-card__content">
                      <p className="eyebrow">{functionalCopy.provisional}</p>
                      <h3>{experience.title}</h3>
                      <p>{experience.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            {!catalogAvailable ? (
              <p className="data-note" role="status">
                El catálogo dinámico no está disponible; estas categorías son inspiración editorial y no confirman una oferta comercial.
              </p>
            ) : null}
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
                <p className="media-caption">Fotografía de referencia del mockup de Figma</p>
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
                    <Image src={benefit.icon} width={32} height={32} alt="" />
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
              <QuoteForm destinationOptions={quoteDestinations} />
            </Reveal>
          </div>
        </section>
      </main>

      <Footer email={contact.email} instagramUrl={contact.instagramUrl} facebookUrl={contact.facebookUrl} />
    </>
  );
}
