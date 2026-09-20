import { memo } from 'react';
import { useTranslation } from '../i18n';

import { useDocumentHead } from '../hooks/useDocumentHead';
import styles from './Home.module.css';

type Zone = 'umbra' | 'penumbra' | 'antumbra';

type ShadowProps = {
  readonly zone: Zone;
  readonly href: string;
  readonly name: string;
  readonly description: string;
};

/**
 * One project, standing on the shadow it is named after.
 *
 * The three are the regions an eclipse casts, read outward from the middle — the full shadow, the
 * partial one around it, and what is left past its tip. So the ground each one stands on is the
 * ordering: nothing here is numbered, because the page already darkens and lightens in the order
 * the names do.
 *
 * Every playground is its own build served out of `public/playground/`, so the link is a plain
 * anchor: it leaves this application rather than being matched by a router, and this application
 * has no second page to route to.
 */
const Shadow = ({ zone, href, name, description }: ShadowProps) => {
  return (
    <li className={[styles['zone'], styles[zone]].join(' ')}>
      <a className={styles['zoneLink']} href={href}>
        {/* How much of the disc the shadow covers: all of it, half of it, only its edge. */}
        <span className={styles['mark']} aria-hidden="true" />
        <span className={styles['zoneName']}>{name}</span>
      </a>
      <p className={styles['zoneText']}>{description}</p>
    </li>
  );
};

export const Home = memo(() => {
  const { t } = useTranslation();

  useDocumentHead({
    title: t('seo.home.title'),
    description: t('seo.home.description'),
    canonical: 'https://francisdesjardins.ca/',
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
        <p className={styles['byline']}>{t('home.location.description')}</p>
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
            zone="umbra"
            href="/playground/boot/"
            name={t('home.work.boot.name')}
            description={t('home.work.boot.description')}
          />
          <Shadow
            zone="penumbra"
            href="/playground/design/"
            name={t('home.work.designSystem.name')}
            description={t('home.work.designSystem.description')}
          />
          <Shadow
            zone="antumbra"
            href="/playground/dialog/"
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
