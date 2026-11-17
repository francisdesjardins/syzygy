import { memo } from 'react';
import { useTranslation } from '../i18n';

import { useDocumentHead } from '../hooks/useDocumentHead';
import styles from './Home.module.css';

type Zone = 'umbra' | 'penumbra' | 'antumbra' | 'bead';

type ShadowProps = {
  readonly zone: Zone;
  readonly href: string;
  readonly name: string;
  readonly description: string;
  /** Further ways in beside the zone's own: its demo, its code. */
  readonly links?: readonly { readonly href: string; readonly label: string }[];
};

/**
 * One project, standing on the shadow it is named after.
 *
 * The light comes first, the beads that break through at the disc's edge, and then the regions the
 * eclipse casts, read outward from the middle — the full shadow, the partial one around it, and
 * what is left past its tip. So the ground each one stands on is the ordering: nothing here is
 * numbered, because the page already lightens and darkens in the order the names do. The light
 * leads because it is the piece a visitor should meet on the first screen.
 *
 * Every playground is its own build served out of `public/playground/`, and Bead, its page and its
 * demo, at its own domain, https://beadproto.dev/, so the link is a plain anchor: it leaves this
 * application rather than being matched by a router, and this application has no second page to
 * route to.
 *
 * Each one lands on the page that answers what the piece does, not on its home. A reader who has
 * decided to look has already been sold; making them navigate is asking them to decide twice.
 */
const Shadow = ({ zone, href, name, description, links }: ShadowProps) => {
  return (
    <li className={[styles['zone'], styles[zone]].join(' ')}>
      <a className={styles['zoneLink']} href={href}>
        {/* How much of the disc the shadow covers: all of it, half of it, only its edge — or the light at it. */}
        {zone === 'bead' ? (
          // Bead's own mark, site/src/favicon.svg of its repository, drawn in the zone's ink: the
          // disc, its lit rim, and the three beads breaking through at its edge
          <svg className={styles['mark']} viewBox="2.6 4.7 25 25" aria-hidden="true">
            <circle cx="14" cy="18" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M 15.82 7.66 A 10.5 10.5 0 0 1 24.19 15.46"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeOpacity="0.6"
            />
            <circle cx="15.94" cy="6.97" r="1.8" fill="currentColor" />
            <circle cx="21.64" cy="9.81" r="2.5" fill="currentColor" />
            <circle cx="24.87" cy="15.29" r="1.5" fill="currentColor" />
          </svg>
        ) : (
          <span className={styles['mark']} aria-hidden="true" />
        )}
        <span className={styles['zoneName']}>{name}</span>
      </a>
      <p className={styles['zoneText']}>{description}</p>
      {links === undefined ? null : (
        <p className={styles['zoneSource']}>
          {links.map((link) => {
            return (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            );
          })}
        </p>
      )}
    </li>
  );
};

export const Home = memo(() => {
  const { t, language } = useTranslation();

  useDocumentHead({
    title: t('seo.home.title'),
    description: t('seo.home.description'),
    // The bare address is the English page and `?lng=fr` the French one, each the sitemap's: one
    // address a language, so a crawler neither folds the French into `/` nor reads two English pages.
    canonical:
      language === 'fr' ? 'https://francisdesjardins.ca/?lng=fr' : 'https://francisdesjardins.ca/',
    ogTitle: t('seo.home.ogTitle'),
    ogDescription: t('seo.home.ogDescription'),
    ogType: 'website',
  });

  return (
    <main className={styles['page']}>
      <header className={styles['identity']}>
        <h1 className={styles['name']} id="main-heading">
          {t('home.name')}
        </h1>
        {/* No title under the name. What he does is the argument in the next column, not a label. */}
        {/*
          Two facts, two elements, so a narrow screen can only break between them. Written as one
          string with a `·` in it, the wrap fell inside "Breathing air" and split the joke.
        */}
        <p className={styles['byline']}>
          <span>{t('home.location.place')}</span>
          <span>{t('home.location.since')}</span>
          <a className={styles['bylineLink']} href="https://github.com/francisdesjardins">
            {t('home.location.github')}
          </a>
        </p>
      </header>

      {/*
        The bio carries its heading for the document outline and not for the eye: "What I build"
        over a paragraph that says what he builds restates its own content, and the page has one
        screen to spend.
      */}
      <section className={styles['bio']} aria-labelledby="bio-heading">
        <h2 className={styles['hidden']} id="bio-heading">
          {t('home.skills.title')}
        </h2>
        <p className={styles['lede']}>{t('home.enough')}</p>
        <p>{t('home.skills.description')}</p>
        <p>{t('home.skills.habits')}</p>
        <p>{t('home.skills.thinking')}</p>
        <p className={styles['quiet']}>{t('home.skills.secondary')}</p>
      </section>

      <section className={styles['work']} aria-labelledby="work-heading">
        <h2 className={styles['workHeading']} id="work-heading">
          {t('home.work.title')}
        </h2>
        <p className={styles['workLede']}>{t('home.work.description')}</p>
        <ul className={styles['shadows']}>
          <Shadow
            zone="bead"
            href="https://beadproto.dev/"
            name={t('home.work.bead.name')}
            description={t('home.work.bead.description')}
            links={[
              { href: 'https://beadproto.dev/playground/', label: t('home.work.bead.demo') },
              {
                href: 'https://github.com/francisdesjardins/bead',
                label: t('home.work.bead.source'),
              },
            ]}
          />
          <Shadow
            zone="umbra"
            href="/playground/boot/#/getting-started"
            name={t('home.work.boot.name')}
            description={t('home.work.boot.description')}
          />
          <Shadow
            zone="penumbra"
            href="/playground/design/#/tokens"
            name={t('home.work.designSystem.name')}
            description={t('home.work.designSystem.description')}
          />
          <Shadow
            zone="antumbra"
            href="/playground/dialog/#/getting-started"
            name={t('home.work.dialog.name')}
            description={t('home.work.dialog.description')}
          />
        </ul>
        <p className={styles['note']}>{t('home.expiry')}</p>
      </section>
    </main>
  );
});

Home.displayName = 'Home';
