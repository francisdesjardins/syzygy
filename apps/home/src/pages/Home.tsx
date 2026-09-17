import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { useDocumentHead } from '../hooks/useDocumentHead';

const Container = styled(Stack)(({ theme }) => {
  return {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    maxWidth: 960,
    margin: '0 auto',
    padding: 'var(--app-space-4)',
    // Flat, not a gradient: a wash from the ground to the paper is either invisible, when the two
    // are close, or it lightens the ground exactly where the card needs something to sit against.
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
      padding: 'var(--app-space-3)',
      // The language and theme switches are `position: fixed` in the top corners, 40px tall at
      // 8px inset. On a phone the card runs full width and the h1 landed underneath both of them —
      // measured overlapping at 390px and at 320px. This clears the band they occupy.
      paddingTop: 'var(--app-space-14)',
      maxWidth: '100%',
    },
  };
});

const ContentStack = styled(Stack)(({ theme }) => {
  return {
    fontFamily: 'var(--app-font-body)',
    // 68ch. The card is 800px wide and a line that long is a line nobody finishes.
    '& p, & .measure': { maxWidth: 'var(--app-measure)' },
    padding: 'var(--app-space-8)',
    width: '100%',
    maxWidth: 960,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 'var(--app-radius-xl)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'var(--app-lift)',
    [theme.breakpoints.down('sm')]: {
      padding: 'var(--app-space-6)',
    },
  };
});

const ExpiryText = styled(Typography)(({ theme }) => {
  return {
    // `text.disabled` measured 2.67:1 on white and the em-based size rendered at 9.6px on a phone —
    // below the 4.5:1 floor and below what anyone reads. `text.secondary` clears it at 5.9:1.
    fontFamily: 'var(--app-font-mono)',
    fontSize: 'var(--app-text-sm)',
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('sm')]: {
      fontSize: 'var(--app-text-xs)',
    },
  };
});

const StyledTypography = styled(Typography)(({ theme }) => {
  return {
    maxWidth: 'var(--app-measure)',
    fontSize: 'var(--app-text-base)',
    lineHeight: 'var(--app-lh-body)',
    [theme.breakpoints.down('sm')]: {
      fontSize: 'var(--app-text-md)',
    },
  };
});

const Columns = styled(Box)(({ theme }) => {
  return {
    display: 'grid',
    gap: 'var(--app-space-6)',
    gridTemplateColumns: 'minmax(0, 1fr)',
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
      columnGap: 'var(--app-space-10)',
      alignItems: 'start',
    },
  };
});

const SectionHeading = styled(Typography)({
  fontFamily: 'var(--app-font-display)',
  fontSize: 'var(--app-text-lg)',
  lineHeight: 'var(--app-lh-snug)',
  letterSpacing: 'var(--app-tracking-snug)',
  fontWeight: 600,
});

const TitleTypography = styled(Typography)(({ theme }) => {
  return {
    fontFamily: 'var(--app-font-display)',
    fontSize: 'var(--app-text-2xl)',
    lineHeight: 'var(--app-lh-tight)',
    letterSpacing: 'var(--app-tracking-tight)',
    fontWeight: 600,
    color: theme.palette.primary.main,
    [theme.breakpoints.down('sm')]: {
      fontSize: 'var(--app-text-xl)',
    },
  };
});

type WorkItemProps = {
  readonly href: string;
  readonly name: string;
  readonly description: string;
  /** A separate build, so the link leaves this application rather than routing inside it. */
  readonly ownBuild?: boolean;
};

/**
 * One library and the surface that demonstrates it.
 *
 * Each playground is its own build served out of `public/playground/`, so its link has to leave
 * this SPA as a plain anchor rather than be matched by the router. A page that belongs to this
 * application takes a RouterLink, which is the difference `ownBuild` names.
 */
const WorkItem = ({ href, name, description, ownBuild = false }: WorkItemProps) => {
  return (
    <Stack component="li" spacing={0.5}>
      <Link
        {...(ownBuild ? { href } : { component: RouterLink, to: href })}
        variant="body2"
        underline="hover"
        sx={{
          fontFamily: 'var(--app-font-mono)',
          fontWeight: 600,
          alignSelf: 'flex-start',
          // WCAG 2.2 target size (2.5.8) wants 24x24 CSS px; the bare text ran 20px tall.
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 'var(--app-space-6)',
        }}
      >
        {name}
      </Link>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
};

export const Home = memo(() => {
  const { t } = useTranslation();

  // Manage document head with custom hook
  useDocumentHead({
    title: t('seo.home.title'),
    description: t('seo.home.description'),
    canonical: 'https://francisdesjardins.ca/',
    ogTitle: t('seo.home.ogTitle'),
    ogDescription: t('seo.home.ogDescription'),
    ogType: 'website',
  });

  return (
    <>
      <Container role="main">
        <ContentStack spacing={3}>
          {/* Main intro section */}
          <Stack spacing={2} component="section">
            <TitleTypography variant="h1" id="main-heading">
              {t('home.name')}
            </TitleTypography>
            <Stack spacing={1}>
              <StyledTypography variant="body1" sx={{ fontWeight: 600 }}>
                {t('home.breathing')}
              </StyledTypography>
              <StyledTypography variant="body2" color="text.secondary">
                {t('home.enough')}
              </StyledTypography>
            </Stack>
          </Stack>

          <Divider />

          <Columns>
            {/* Left column: what the work is, and where it is done from */}
            <Stack spacing={3}>
              <Stack spacing={2} component="section" aria-labelledby="skills-heading">
                <SectionHeading variant="h2" id="skills-heading">
                  {t('home.skills.title')}
                </SectionHeading>
                <Typography variant="body2" color="text.secondary" component="p">
                  {t('home.skills.description')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="p"
                  sx={{ fontStyle: 'italic' }}
                >
                  {t('home.skills.secondary')}
                </Typography>
              </Stack>

              <Stack spacing={2} component="section" aria-labelledby="location-heading">
                <SectionHeading variant="h2" id="location-heading">
                  {t('home.location.title')}
                </SectionHeading>
                <Typography variant="body2" color="text.secondary" component="p">
                  {t('home.location.description')}
                </Typography>
              </Stack>
            </Stack>

            {/* Right column: the libraries, each linking out to its own playground */}
            <Stack
              spacing={2}
              component="section"
              aria-labelledby="work-heading"
              sx={{
                // The rule between the columns only exists once the columns do.
                borderLeft: { md: 1 },
                borderColor: { md: 'divider' },
                pl: { md: 'var(--app-space-10)' },
              }}
            >
              <SectionHeading variant="h2" id="work-heading">
                {t('home.work.title')}
              </SectionHeading>
              <Typography variant="body2" color="text.secondary" component="p">
                {t('home.work.description')}
              </Typography>
              <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                <WorkItem
                  ownBuild
                  href="/playground/dialog/"
                  name={t('home.work.dialog.name')}
                  description={t('home.work.dialog.description')}
                />
                <WorkItem
                  ownBuild
                  href="/playground/boot/"
                  name={t('home.work.boot.name')}
                  description={t('home.work.boot.description')}
                />
                <WorkItem
                  href="/design-system"
                  name={t('home.work.designSystem.name')}
                  description={t('home.work.designSystem.description')}
                />
              </Stack>
            </Stack>
          </Columns>

          <Stack sx={{ alignItems: 'flex-end' }}>
            <ExpiryText variant="caption">{t('home.expiry')}</ExpiryText>
          </Stack>
        </ContentStack>
      </Container>
    </>
  );
});

Home.displayName = 'Home';
