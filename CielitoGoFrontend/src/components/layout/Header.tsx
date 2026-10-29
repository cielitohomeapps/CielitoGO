"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { functionalCopy, siteContent } from "@/content/es";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("inicio");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = siteContent.navigation
      .map(({ href }) => document.getElementById(href.slice(1)))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-25% 0px -65%", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const backgroundRegions = [main, footer].filter((region): region is HTMLElement => region instanceof HTMLElement);

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !menuOpen || !navigationRef.current) return;
      const focusable = Array.from(
        navigationRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    document.body.dataset.menuOpen = menuOpen ? "true" : "false";
    backgroundRegions.forEach((region) => {
      if (menuOpen) region.setAttribute("inert", "");
      else region.removeAttribute("inert");
    });

    if (menuOpen) {
      navigationRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    }

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      backgroundRegions.forEach((region) => region.removeAttribute("inert"));
      delete document.body.dataset.menuOpen;
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <a className="brand-link" href="#inicio" aria-label="Cielito Go, inicio">
          <Image
            src="/CielitoGo.png"
            width={2440}
            height={1146}
            priority
            sizes="(max-width: 767px) 82px, 104px"
            alt="Cielito Go"
            className="brand-logo"
          />
        </a>

        <button
          ref={menuButtonRef}
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? functionalCopy.menuClose : functionalCopy.menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>

        <nav
          ref={navigationRef}
          id="main-navigation"
          className={`main-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Navegación principal"
        >
          <ul>
            {siteContent.navigation.map((item) => {
              const id = item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={activeId === id ? "location" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <a className="button button--primary main-nav__cta" href="#cotizar" onClick={() => setMenuOpen(false)}>
            {siteContent.conversion.primaryCta}
          </a>
        </nav>
      </div>
    </header>
  );
}
