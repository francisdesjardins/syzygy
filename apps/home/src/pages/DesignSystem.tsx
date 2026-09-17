import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { useDocumentHead } from '../hooks/useDocumentHead';
import { useTheme } from '../hooks/useTheme';

// The specimen's own rules, scoped to the preview. In the lazy chunk rather than the entry, with
// the page that is the only thing on this site using them.
import '../styles/specimen.css';

import baseSheet from 'penumbra/tokens.skin.base.css?raw';
import replacedSheet from '../styles/skins/replaced.css?raw';
import tintSheet from '../styles/skins/tint.css?raw';

/**
 * A token sheet declares `:root` because that is where a design system lives: one document, one set
 * of values. A preview is the one place that is not true — three of them share this page, and each
 * answers for its own subtree only.
 *
 * Rewriting the selector rather than keeping scoped copies is what makes the demonstration honest:
 * the bytes below are the package's own file and the two example skins as they sit on disk, so an
 * edit to any of them shows up here and cannot be contradicted by a copy nobody updated.
 */
const scopeSkin = (css: string): string => {
  return css.replaceAll(':root', '[data-penumbra-preview]');
};

/** The three layerings the switch offers, each one a project somebody could have written. */
const STATES = {
  base: {
    sheets: [baseSheet],
    chain: 'tokens.system.css → tokens.skin.base.css',
  },
  tint: {
    sheets: [baseSheet, tintSheet],
    chain: 'tokens.system.css → tokens.skin.base.css → tint.css',
  },
  replaced: {
    sheets: [replacedSheet],
    chain: 'tokens.system.css → replaced.css',
  },
} as const;

type StateName = keyof typeof STATES;

const STATE_NAMES: readonly StateName[] = ['base', 'tint', 'replaced'];

/** The eight names a skin declares, which also gives the specimen a list to style. */
const BRAND_TOKENS = [
  '--app-primary',
  '--app-primary-ink',
  '--app-primary-hover',
  '--app-accent',
  '--app-flame',
  '--app-flame-wash',
  '--app-ring',
  '--app-glow',
] as const;

const Container = styled(Stack)(({ theme }) => {
  return {
    minHeight: '100vh',
    maxWidth: 960,
    margin: '0 auto',
    padding: 'var(--app-space-8) var(--app-space-4) var(--app-space-12)',
    gap: 'var(--app-space-6)',
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
      // The language and theme switches are fixed in the top corners; this clears the band they
      // occupy, the way the home page does.
      paddingTop: 'var(--app-space-14)',
      paddingInline: 'var(--app-space-3)',
    },
  };
});

const Title = styled(Typography)(({ theme }) => {
  return {
    fontFamily: 'var(--app-font-display)',
    fontSize: 'var(--app-text-2xl)',
    lineHeight: 'var(--app-lh-tight)',
    letterSpacing: 'var(--app-tracking-tight)',
    fontWeight: 600,
    color: theme.palette.primary.main,
    [theme.breakpoints.down('sm')]: { fontSize: 'var(--app-text-xl)' },
  };
});

const SectionHeading = styled(Typography)({
  fontFamily: 'var(--app-font-display)',
  fontSize: 'var(--app-text-lg)',
  lineHeight: 'var(--app-lh-snug)',
  fontWeight: 600,
});

const Chain = styled('p')(({ theme }) => {
  return {
    margin: 0,
    fontFamily: 'var(--app-font-mono)',
    fontSize: 'var(--app-text-xs)',
    color: theme.palette.text.secondary,
    overflowWrap: 'anywhere',
  };
});

export function DesignSystem() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [state, setState] = useState<StateName>('tint');

  useDocumentHead({
    title: t('seo.designSystem.title'),
    description: t('seo.designSystem.description'),
    canonical: 'https://francisdesjardins.ca/design-system',
    ogTitle: t('seo.designSystem.ogTitle'),
    ogDescription: t('seo.designSystem.ogDescription'),
    ogType: 'article',
  });

  const active = STATES[state];

  return (
    <Container role="main">
      <Link
        component={RouterLink}
        to="/"
        variant="body2"
        underline="hover"
        sx={{ alignSelf: 'flex-start' }}
      >
        ← {t('designSystem.back')}
      </Link>

      <Stack spacing={2} component="section">
        <Title variant="h1" id="main-heading">
          {t('designSystem.title')}
        </Title>
        <Typography
          variant="body1"
          component="p"
          sx={{ maxWidth: 'var(--app-measure)', lineHeight: 'var(--app-lh-body)' }}
        >
          {t('designSystem.intro')}
        </Typography>
      </Stack>

      <Stack spacing={2} component="section" aria-labelledby="switch-heading">
        <SectionHeading variant="h2" id="switch-heading">
          {t('designSystem.switchHeading')}
        </SectionHeading>

        <ToggleButtonGroup
          exclusive
          value={state}
          aria-labelledby="switch-heading"
          onChange={(_event, next: StateName | null) => {
            // A toggle group answers `null` when the pressed button was already the active one.
            // Keeping the current state is what stops the preview from emptying under the reader.
            if (next !== null) {
              setState(next);
            }
          }}
          sx={{ flexWrap: 'wrap' }}
        >
          {STATE_NAMES.map((name) => {
            return (
              // MUI spends `rgba(0, 0, 0, 0.54)` on an unselected button, which composites to
              // 4.42:1 on this page's ground — under AA, and on a page about measured colour.
              <ToggleButton
                key={name}
                value={name}
                sx={{ textTransform: 'none', color: 'text.primary' }}
              >
                {t(`designSystem.states.${name}.name`)}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        <Typography
          variant="body2"
          component="p"
          color="text.secondary"
          sx={{ maxWidth: 'var(--app-measure)', lineHeight: 'var(--app-lh-body)' }}
        >
          {t(`designSystem.states.${state}.note`)}
        </Typography>
        <Chain>{active.chain}</Chain>
      </Stack>

      <Box data-penumbra-preview="" data-color-scheme={isDarkMode ? 'dark' : 'light'}>
        <style>{active.sheets.map(scopeSkin).join('\n')}</style>

        <div className="specimen-card">
          <div className="specimen-row">
            <span className="specimen-mark" aria-hidden="true" />
            <h3 className="specimen-title">{t('designSystem.specimen.title')}</h3>
          </div>

          <p className="specimen-body">
            {t('designSystem.specimen.body')}{' '}
            <a href="/playground/dialog/">{t('designSystem.specimen.link')}</a>
          </p>
          <p className="specimen-secondary">{t('designSystem.specimen.secondary')}</p>

          <hr className="specimen-rule" />

          <div className="specimen-row">
            <button type="button" className="specimen-primary">
              {t('designSystem.specimen.save')}
            </button>
            <button type="button" className="specimen-outline">
              {t('designSystem.specimen.cancel')}
            </button>
            <button type="button" className="specimen-danger">
              {t('designSystem.specimen.delete')}
            </button>
          </div>

          <div className="specimen-row">
            <span className="specimen-ring">
              <span className="specimen-dot" aria-hidden="true" />
              {t('designSystem.specimen.live')}
            </span>
            <span className="specimen-scrim" aria-hidden="true" />
          </div>

          <div className="specimen-row">
            <span className="specimen-badge" data-tone="ok">
              {t('designSystem.specimen.tones.ok')}
            </span>
            <span className="specimen-badge" data-tone="info">
              {t('designSystem.specimen.tones.info')}
            </span>
            <span className="specimen-badge" data-tone="warn">
              {t('designSystem.specimen.tones.warn')}
            </span>
            <span className="specimen-badge" data-tone="error">
              {t('designSystem.specimen.tones.error')}
            </span>
          </div>

          <ul className="specimen-list" aria-label={t('designSystem.specimen.listLabel')}>
            {BRAND_TOKENS.map((token) => {
              return (
                <li key={token} aria-selected={token === '--app-primary'}>
                  {token}
                </li>
              );
            })}
          </ul>

          <p className="specimen-caption">{t('designSystem.specimen.caption')}</p>
        </div>
      </Box>
    </Container>
  );
}
