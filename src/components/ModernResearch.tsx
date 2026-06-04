import { memo, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Box, Typography, Collapse, Link, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { RESEARCH_PAPERS, SCHOLAR_PROFILE_URL } from '../constants';
import DetectionFrame from './DetectionFrame';
import LiquidGlass from './LiquidGlass';

interface ResearchPaper {
  year: string;
  title: string;
  authors: string;
  venue: string;
  venueType: string;
  scopusIndexed?: string;
  doi?: string;
  description: string;
  keywords: string[];
  isFirstAuthor: boolean;
  citations: number;
}

// Signature reveal curve (ease-out-quint), typed for framer-motion.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Mono labels: medium weight + an ink-leaning tint so the small type stays legible
// over the frosted glass (the default secondary gray read too thin on the moving bg).
const MONO_LABEL = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  color: 'color-mix(in srgb, var(--app-palette-text-primary) 72%, transparent)',
} as const;

// Steadier glass: more opaque tint than the 62% default so publication text reads
// cleanly where the animated background streaks pass behind the cards.
const GLASS_TINT = {
  '--lg-tint': 'color-mix(in srgb, var(--app-palette-bg-elevated) 80%, transparent)',
} as CSSProperties;

// Shared external-link styling: the trailing icon nudges out on hover (a small
// "opens elsewhere" cue) and underlines, reduced-motion-gated.
const EXTERNAL_LINK_SX: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
  fontSize: '0.74rem',
  color: 'primary.main',
  '& svg': { transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)' },
  '&:hover': { textDecoration: 'underline' },
  '&:hover svg': { transform: 'translate(2px, -2px)' },
  '@media (prefers-reduced-motion: reduce)': {
    '& svg': { transition: 'none' },
    '&:hover svg': { transform: 'none' },
  },
};

// The "first author" badge rides the detection frame's aria-hidden tag, so screen
// readers get the same credential via a visually-hidden marker inside the heading.
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

// The portfolio's own author byline. Rendered byte-for-byte from the data, but the
// owner's name is lifted so lead authorship reads at a glance (and sits honestly
// mid-list on the one paper where he isn't first author).
const AUTHOR_NAME = 'Perdana, G. A.';

const AuthorLine = ({ authors }: { authors: string }) => {
  const idx = authors.indexOf(AUTHOR_NAME);
  if (idx === -1) return <>{authors}</>;
  return (
    <>
      {authors.slice(0, idx)}
      <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
        {AUTHOR_NAME}
      </Box>
      {authors.slice(idx + AUTHOR_NAME.length)}
    </>
  );
};

// One publication framed as a "detection result" on a liquid-glass surface: corner
// brackets lock on, a class label ("first author") rides the top edge, the abstract
// opens on demand.
const PublicationEntry = memo(({ paper, index }: { paper: ResearchPaper; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const descId = `research-summary-${index}`;

  return (
    <LiquidGlass
      intensity="subtle"
      interactive
      blur={12}
      radius={16}
      style={GLASS_TINT}
      sx={{
        px: { xs: 1.25, md: 1.5 },
        py: { xs: 1.25, md: 1.5 },
        transition:
          'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          '--lg-shadow': '0 16px 40px rgba(0, 0, 0, 0.30)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <DetectionFrame
        tag={paper.isFirstAuthor ? 'first author' : undefined}
        sx={{
          px: { xs: 1.75, md: 2.25 },
          py: { xs: 1.5, md: 1.75 },
          '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 58%, transparent)',
          '@media (hover: hover)': {
            '&:hover': {
              '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 95%, transparent)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '92px minmax(0, 1fr)' },
            columnGap: { md: 3 },
            rowGap: { xs: 1.5, md: 0 },
          }}
        >
          {/* Meta rail */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              alignItems: { xs: 'baseline', md: 'flex-start' },
              gap: { xs: 1, md: 0.5 },
            }}
          >
            <Box
              component="span"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                fontSize: '0.9rem',
                lineHeight: 1,
                color: 'text.primary',
                letterSpacing: '0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {paper.year}
            </Box>
            <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.64rem', letterSpacing: '0.14em' }}>
              {paper.venueType.toUpperCase()}
            </Box>
          </Box>

          {/* Main column */}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h3"
              sx={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'clamp(1.05rem, 0.5vw + 0.95rem, 1.2rem)',
                lineHeight: 1.32,
                letterSpacing: '-0.01em',
                color: 'text.primary',
                textWrap: 'pretty',
                mb: 1,
              }}
            >
              {paper.title}
              {paper.isFirstAuthor && (
                <Box component="span" sx={visuallyHidden}>
                  {' '}
                  (first author)
                </Box>
              )}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'color-mix(in srgb, var(--app-palette-text-primary) 70%, transparent)',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                mb: 0.5,
              }}
            >
              <AuthorLine authors={paper.authors} />
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.875rem', mb: 1.75 }}
            >
              {paper.venue}
            </Typography>

            {/* Topic keywords */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {paper.keywords.map((kw) => (
                <Box
                  key={kw}
                  component="span"
                  sx={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    lineHeight: 1.5,
                    letterSpacing: '0.01em',
                    color: 'color-mix(in srgb, var(--app-palette-text-primary) 80%, transparent)',
                    bgcolor: 'color-mix(in srgb, var(--app-palette-text-primary) 6%, transparent)',
                    px: 0.85,
                    py: 0.4,
                    border: '1px solid color-mix(in srgb, var(--app-palette-divider) 85%, transparent)',
                    borderRadius: '5px',
                  }}
                >
                  {kw}
                </Box>
              ))}
            </Box>

            {/* Summary */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 1.75 }}>
                <Box component="div" sx={{ ...MONO_LABEL, fontSize: '0.62rem', letterSpacing: '0.18em', mb: 0.85 }}>
                  SUMMARY
                </Box>
                <Typography
                  id={descId}
                  variant="body2"
                  sx={{
                    color: 'color-mix(in srgb, var(--app-palette-text-primary) 88%, transparent)',
                    fontSize: '0.9rem',
                    lineHeight: 1.72,
                  }}
                >
                  {paper.description}
                </Typography>
              </Box>
            </Collapse>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1.75 }}>
              <Button
                onClick={() => setExpanded((prev) => !prev)}
                size="small"
                variant="text"
                aria-expanded={expanded}
                aria-controls={descId}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transition: 'transform 0.25s ease',
                      transform: expanded ? 'rotate(180deg)' : 'none',
                    }}
                  />
                }
                sx={{
                  px: 0.5,
                  minHeight: { xs: 44, sm: 'auto' },
                  minWidth: 0,
                  textTransform: 'none',
                  color: 'color-mix(in srgb, var(--app-palette-text-primary) 72%, transparent)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  fontSize: '0.74rem',
                  '&:hover': { color: 'text.primary', backgroundColor: 'transparent' },
                }}
              >
                {expanded ? 'Hide summary' : 'Read summary'}
              </Button>

              {paper.doi && (
                <Link
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  aria-label={`DOI ${paper.doi}, opens in a new tab`}
                  sx={EXTERNAL_LINK_SX}
                >
                  DOI
                  <OpenInNewIcon sx={{ fontSize: 13 }} />
                </Link>
              )}

              {paper.citations > 0 && (
                <Box
                  component="span"
                  sx={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    fontSize: '0.74rem',
                    color: 'color-mix(in srgb, var(--app-palette-text-primary) 72%, transparent)',
                  }}
                >
                  Cited by {paper.citations}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DetectionFrame>
    </LiquidGlass>
  );
});

PublicationEntry.displayName = 'PublicationEntry';

const ModernResearchComponent = () => {
  const papers = useMemo<ResearchPaper[]>(() => RESEARCH_PAPERS as ResearchPaper[], []);

  // Headline credibility figures, derived from the data so they never drift.
  const stats = useMemo(
    () => [
      { value: papers.length, label: papers.length === 1 ? 'PUBLICATION' : 'PUBLICATIONS' },
      { value: papers.filter((p) => p.isFirstAuthor).length, label: 'FIRST AUTHOR' },
    ],
    [papers],
  );

  const prefersReducedMotion = useReducedMotion();
  const reduce = !!prefersReducedMotion;

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef as RefObject<HTMLDivElement>, { once: true, margin: '-15% 0px' });

  // Per-element reveal; static under reduced motion. Delays cascade top-to-bottom.
  const item = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <Box ref={rootRef}>
      {/* Section header (always visible; the record + entries choreograph in) */}
      <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
          Research
        </Typography>
        <Typography variant="h2" component="h2" sx={{ color: 'text.primary' }}>
          Publications
        </Typography>
      </Box>

      {/* Publication record — the signature dossier strip (glass + one-shot scan) */}
      <motion.div {...item(0.05)}>
        <LiquidGlass
          intensity="subtle"
          blur={12}
          radius={16}
          style={GLASS_TINT}
          sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 1.25, md: 1.5 } }}
        >
          <DetectionFrame scan active={inView} sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 1, md: 1.25 } }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 1.5, md: 2 },
              }}
            >
              <Box component="span" sx={{ ...MONO_LABEL }}>
                // publication record
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: { xs: 1.75, md: 2.5 } }}>
                {stats.map((s) => (
                  <Box key={s.label} sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.6 }}>
                    <Box
                      component="span"
                      sx={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        color: 'text.primary',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.value}
                    </Box>
                    <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.64rem', letterSpacing: '0.14em' }}>
                      {s.label}
                    </Box>
                  </Box>
                ))}

                <Link
                  href={SCHOLAR_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  aria-label="View citation record on Google Scholar, opens in a new tab"
                  sx={EXTERNAL_LINK_SX}
                >
                  Google Scholar
                  <OpenInNewIcon sx={{ fontSize: 13 }} />
                </Link>
              </Box>
            </Box>
          </DetectionFrame>
        </LiquidGlass>
      </motion.div>

      {/* Entries */}
      <Box sx={{ mt: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.75, md: 2.25 } }}>
        {papers.map((paper, index) => (
          <motion.div key={`${paper.title}-${index}`} {...item(0.12 + index * 0.07)}>
            <PublicationEntry paper={paper} index={index} />
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

const ModernResearch = memo(ModernResearchComponent);
ModernResearch.displayName = 'ModernResearch';

export default ModernResearch;
