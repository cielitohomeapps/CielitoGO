import Image from "next/image";

import { siteContent } from "@/content/es";

type FooterProps = {
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
};

export function Footer({ email, instagramUrl, facebookUrl }: FooterProps) {
  const socialLinks = [
    instagramUrl ? { label: "Instagram", href: instagramUrl, icon: "/images/figma/social-instagram.svg", external: true } : null,
    facebookUrl ? { label: "Facebook", href: facebookUrl, icon: "/images/figma/social-facebook.svg", external: true } : null,
    email ? { label: "Correo electrónico", href: `mailto:${email}`, icon: "/images/figma/social-mail.svg", external: false } : null,
  ].filter((link): link is NonNullable<typeof link> => Boolean(link));

  return (
    <footer className="site-footer">
      <div className="site-footer__main shell">
        <div className="site-footer__brand">
          <div className="site-footer__logo-frame">
            <Image
              src="/CielitoGo.png"
              width={2440}
              height={1146}
              sizes="120px"
              alt="Cielito Go"
            />
          </div>
          <p className="site-footer__claim">{siteContent.footer.claim}</p>
          <p>{siteContent.footer.body}</p>
        </div>

        <div>
          <h2 className="site-footer__heading">Explora</h2>
          <ul className="site-footer__links">
            {siteContent.navigation.slice(1).map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="site-footer__heading">Información</h2>
          <ul className="site-footer__links">
            <li><span>Aviso de privacidad pendiente de publicación</span></li>
            <li><span>Términos comerciales pendientes</span></li>
          </ul>
        </div>

        <div>
          <h2 className="site-footer__heading">Contacto verificado</h2>
          {socialLinks.length ? (
            <div className="social-links">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.external ? `${link.label} (se abre en otra pestaña)` : link.label}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                >
                  <Image src={link.icon} width={20} height={20} alt="" />
                </a>
              ))}
            </div>
          ) : (
            <p className="site-footer__pending">Se mostrará cuando la API entregue datos confirmados.</p>
          )}
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="shell">
          <p>© {new Date().getFullYear()} Cielito Go. Contenido comercial sujeto a confirmación.</p>
        </div>
      </div>
    </footer>
  );
}
