import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDocumentHead } from '../hooks/useDocumentHead';
import styles from './Home.module.css';

type WorkItemProps = {
  readonly href: string;
  readonly name: string;
  readonly description: string;
};

/**
 * One project and the playground that demonstrates it.
 *
 * Every one of them is its own build served out of `public/playground/`, so the link is a plain
 * anchor: it leaves this application rather than being matched by the router. That used to be a
 * `ownBuild` flag with a router link on the other branch, and the last page that needed the other
 * branch was this site's own design-system page, which moved to penumbra's playground.
 */
const WorkItem = ({ href, name, description }: WorkItemProps) => {
  return (
    <li className={styles['workItem']}>
      <a className={styles['workLink']} href={href}>
        {name}
      </a>
      <p className={styles['secondary']}>{description}</p>
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
    <main className={styles['container']}>
      <div className={styles['card']}>
        <section className={styles['intro']}>
          <h1 className={styles['title']} id="main-heading">
            {t('home.name')}
          </h1>
          <div className={styles['lede']}>
            <p className={styles['body']}>{t('home.breathing')}</p>
            <p className={styles['secondary']}>{t('home.enough')}</p>
          </div>
        </section>

        <hr className={styles['rule']} />

        <div className={styles['columns']}>
          {/* Left column: what the work is, and where it is done from */}
          <div className={styles['column']}>
            <section className={styles['section']} aria-labelledby="skills-heading">
              <h2 className={styles['heading']} id="skills-heading">
                {t('home.skills.title')}
              </h2>
              <p className={styles['secondary']}>{t('home.skills.description')}</p>
              <p className={styles['secondary']}>{t('home.skills.thinking')}</p>
              <p className={[styles['secondary'], styles['italic']].join(' ')}>
                {t('home.skills.secondary')}
              </p>
            </section>

            <section className={styles['section']} aria-labelledby="location-heading">
              <h2 className={styles['heading']} id="location-heading">
                {t('home.location.title')}
              </h2>
              <p className={styles['secondary']}>{t('home.location.description')}</p>
            </section>
          </div>

          {/* Right column: the three projects, each linking out to its own playground */}
          <section
            className={[styles['section'], styles['aside']].join(' ')}
            aria-labelledby="work-heading"
          >
            <h2 className={styles['heading']} id="work-heading">
              {t('home.work.title')}
            </h2>
            <p className={styles['secondary']}>{t('home.work.description')}</p>
            <ul className={styles['work']}>
              <WorkItem
                href="/playground/dialog/"
                name={t('home.work.dialog.name')}
                description={t('home.work.dialog.description')}
              />
              <WorkItem
                href="/playground/boot/"
                name={t('home.work.boot.name')}
                description={t('home.work.boot.description')}
              />
              <WorkItem
                href="/playground/design/"
                name={t('home.work.designSystem.name')}
                description={t('home.work.designSystem.description')}
              />
            </ul>
          </section>
        </div>

        <div className={styles['footer']}>
          <p className={styles['expiry']}>{t('home.expiry')}</p>
        </div>
      </div>
    </main>
  );
});

Home.displayName = 'Home';
