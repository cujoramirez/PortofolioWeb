import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { Box, Chip, Typography, alpha } from '@mui/material';

import {
  ABOUT_TEXT,
  ABOUT_QUOTES,
  RESEARCH_PAPERS,
  SCHOLAR_CITATIONS,
  SCHOLAR_PROFILE_URL,
  ABOUT_FACTS,
} from '../constants/index';
import { technologies, type TechnologyCategory } from './techData';
import LiquidGlass from './LiquidGlass';
import DetectionFrame from './DetectionFrame';

// Order the skill groups for a stable, scannable layout
const CATEGORY_ORDER: TechnologyCategory[] = ['AI/ML', 'Backend', 'Frontend', 'Other'];

// Signature reveal curve, typed so framer-motion accepts it as a cubic-bezier.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Mono labels: medium weight + an ink-leaning tint so the small type stays legible over the
// frosted glass (shared treatment with every other section; the default gray read too thin).
const MONO_LABEL = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  color: 'color-mix(in srgb, var(--app-palette-text-primary) 72%, transparent)',
} as const;

// Steadier glass: more opaque tint than the 62% default so this text-heavy card reads cleanly
// where the animated background streaks pass behind it (matches Research/Projects/etc.).
const GLASS_TINT = {
  '--lg-tint': 'color-mix(in srgb, var(--app-palette-bg-elevated) 80%, transparent)',
} as CSSProperties;

// Count from 0 to a target when the card scrolls in; static under reduced motion.
const CountUp = ({ value, active, reduce }: { value: number; active: boolean; reduce: boolean }) => {
  const [display, setDisplay] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!active) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [active, value, reduce]);
  return <>{display}</>;
};

const ModernAbout = () => {
  const paragraphs = useMemo(
    () => ABOUT_TEXT.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    [],
  );

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: technologies.filter((t) => t.category === category),
      })).filter((g) => g.items.length > 0),
    [],
  );

  // Publication metrics derive from the data layer so they never drift.
  const pubCount = RESEARCH_PAPERS.length;
  const firstAuthorCount = useMemo(
    () => RESEARCH_PAPERS.filter((p) => p.isFirstAuthor).length,
    [],
  );

  const prefersReducedMotion = useReducedMotion();
  const reduce = !!prefersReducedMotion;

  // One-shot reveal when the card scrolls into view.
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef as RefObject<HTMLDivElement>, { once: true, margin: '-15% 0px' });

  // Per-element reveal (static when reduced motion). Delays cascade top-to-bottom.
  const item = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  // Spec-sheet detail rows. Every value traces to a fact in the data layer.
  const detailRows: { label: string; tag: string; value: string; detail?: ReactNode }[] = [
    {
      label: 'FOCUS',
      tag: '0.99',
      value: 'Computer Vision · Deep Learning',
      detail: 'Vision Transformers · Ensemble Learning · Model Calibration',
    },
    {
      label: 'EDUCATION',
      tag: '0.97',
      value: 'BINUS University · Computer Science',
      detail: (
        <>
          GPA{' '}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {ABOUT_FACTS.gpa}
          </Box>{' '}
          / {ABOUT_FACTS.gpaScale}
        </>
      ),
    },
    {
      label: 'PROGRAM',
      tag: '0.96',
      value: 'Apple Developer Academy Scholar',
      detail: (
        <>
          Cohort 2026 ·{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {ABOUT_FACTS.academy.rate} acceptance rate
          </Box>
          <Box component="span" sx={{ display: 'block', mt: 0.25 }}>
            {ABOUT_FACTS.academy.accepted} of {ABOUT_FACTS.academy.applicants} applicants
          </Box>
        </>
      ),
    },
  ];

  // Rotating quote (single visible; paused for reduced motion).
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    if (reduce || ABOUT_QUOTES.length <= 1) return;
    const id = setInterval(() => {
      setQuoteIndex((idx) => (idx + 1) % ABOUT_QUOTES.length);
    }, 6000);
    return () => clearInterval(id);
  }, [reduce]);
  const quote = ABOUT_QUOTES[quoteIndex];

  // Shared styling for the two metric cells.
  const metricNumberSx = {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(1.7rem, 1.1vw + 1.35rem, 2.05rem)',
    lineHeight: 1,
    color: 'text.primary',
    fontVariantNumeric: 'tabular-nums',
  };
  const metricLabelSx = { ...MONO_LABEL, fontSize: '0.62rem', letterSpacing: '0.18em', mt: 1 };
  const metricSubSx = { color: 'text.secondary', fontSize: '0.76rem', mt: 0.5, lineHeight: 1.4 };

  return (
    <Box ref={rootRef}>
      {/* Section header (outside the card) */}
      <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
          About
        </Typography>
        <Typography variant="h2" component="h2" sx={{ color: 'text.primary' }}>
          Background
        </Typography>
      </Box>

      {/* The dossier card */}
      <LiquidGlass component="div" intensity="subtle" blur={12} radius={20} style={GLASS_TINT} sx={{ p: { xs: 2.5, md: 4 } }}>
        <DetectionFrame scan active={inView}>
          {/* Header bar */}
          <motion.div {...item(0.1)}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 2,
                flexWrap: 'wrap',
                pb: 1.5,
                mb: { xs: 3, md: 4 },
                borderBottom: '1px solid var(--app-palette-divider)',
              }}
            >
              <Box aria-hidden component="span" sx={{ ...MONO_LABEL }}>
                // model card
              </Box>
              <Box component="span" sx={{ ...MONO_LABEL, letterSpacing: '0.1em' }}>
                AI Researcher · Computer Vision
              </Box>
            </Box>
          </motion.div>

          {/* Body: OVERVIEW + spec sheet */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 21rem)' },
              gap: { xs: 4, md: 5 },
              alignItems: 'start',
            }}
          >
            {/* OVERVIEW */}
            <motion.div {...item(0.2)}>
              <Typography component="div" sx={{ ...MONO_LABEL, mb: 1.5 }}>
                OVERVIEW
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, maxWidth: '66ch' }}>
                {paragraphs.map((p, i) => (
                  <Typography
                    key={i}
                    variant="body1"
                    component="p"
                    sx={{
                      m: 0,
                      color: 'text.primary',
                      fontSize: i === 0 ? 'clamp(1.12rem, 0.5vw + 1rem, 1.25rem)' : '1.05rem',
                      fontWeight: i === 0 ? 600 : 500,
                      lineHeight: i === 0 ? 1.6 : 1.7,
                      letterSpacing: i === 0 ? '-0.003em' : 0,
                      textWrap: 'pretty',
                    }}
                  >
                    {p}
                  </Typography>
                ))}
              </Box>
            </motion.div>

            {/* Spec sheet */}
            <Box>
              <motion.div {...item(0.24)}>
                <Typography component="div" sx={{ ...MONO_LABEL, mb: 1.75 }}>
                  SPEC SHEET
                </Typography>
              </motion.div>

              {/* Metric pair: publications + citations */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mb: 1.75 }}>
                <motion.div {...item(0.3)} style={{ height: '100%' }}>
                  <DetectionFrame interactive sx={{ px: 1.75, py: 1.5, height: '100%' }}>
                    <Typography component="div" sx={{ ...metricNumberSx }}>
                      <CountUp value={pubCount} active={inView} reduce={reduce} />
                    </Typography>
                    <Typography component="div" sx={{ ...metricLabelSx }}>
                      PUBLICATIONS
                    </Typography>
                    <Typography component="div" sx={{ ...metricSubSx }}>
                      {firstAuthorCount} as first author
                    </Typography>
                  </DetectionFrame>
                </motion.div>

                <motion.div {...item(0.36)} style={{ height: '100%' }}>
                  <Box
                    component="a"
                    href={SCHOLAR_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${SCHOLAR_CITATIONS} citations on Google Scholar, opens in a new tab`}
                    sx={{
                      display: 'block',
                      height: '100%',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      '&:focus-visible': {
                        outline: '2px solid var(--app-palette-primary-main)',
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    <DetectionFrame interactive sx={{ px: 1.75, py: 1.5, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography component="span" sx={{ ...metricNumberSx }}>
                          <CountUp value={SCHOLAR_CITATIONS} active={inView} reduce={reduce} />
                        </Typography>
                        <Box
                          aria-hidden
                          component="span"
                          sx={{
                            color: 'var(--df-stroke)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            transition: 'color 0.25s ease',
                          }}
                        >
                          ↗
                        </Box>
                      </Box>
                      <Typography component="div" sx={{ ...metricLabelSx }}>
                        CITATIONS
                      </Typography>
                      <Typography component="div" sx={{ ...metricSubSx }}>
                        Google Scholar
                      </Typography>
                    </DetectionFrame>
                  </Box>
                </motion.div>
              </Box>

              {/* Detail rows */}
              <Box component="dl" sx={{ m: 0, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                {detailRows.map((f, i) => (
                  <motion.div key={f.label} {...item(0.42 + i * 0.06)}>
                    <DetectionFrame interactive tag={f.tag} sx={{ px: 1.75, py: 1.25 }}>
                      <Typography
                        component="dt"
                        sx={{ ...MONO_LABEL, fontSize: '0.66rem', letterSpacing: '0.18em' }}
                      >
                        {f.label}
                      </Typography>
                      <Typography
                        component="dd"
                        sx={{ m: 0, mt: 0.75, color: 'text.primary', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}
                      >
                        {f.value}
                      </Typography>
                      {f.detail && (
                        <Typography
                          component="dd"
                          sx={{ m: 0, mt: 0.5, color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}
                        >
                          {f.detail}
                        </Typography>
                      )}
                    </DetectionFrame>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </Box>

          {/* STACK */}
          <motion.div {...item(0.6)}>
            <Box sx={{ mt: { xs: 4, md: 5 }, pt: 3, borderTop: '1px solid var(--app-palette-divider)' }}>
              <Typography component="div" sx={{ ...MONO_LABEL, mb: 2.5 }}>
                STACK
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {grouped.map(({ category, items }) => (
                  <Box
                    key={category}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '110px 1fr' },
                      gap: { xs: 1, sm: 2 },
                      alignItems: 'start',
                    }}
                  >
                    <Typography sx={{ ...MONO_LABEL, fontSize: '0.7rem', letterSpacing: '0.12em', pt: { sm: 0.75 } }}>
                      {category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {items.map((tech) => {
                        const Icon = tech.icon;
                        return (
                          <Chip
                            key={tech.name}
                            icon={<Box component={Icon} aria-hidden sx={{ color: `${tech.color} !important`, fontSize: '1rem' }} />}
                            label={tech.name}
                            variant="outlined"
                            sx={{
                              borderColor: 'color-mix(in srgb, var(--app-palette-divider) 40%, transparent)',
                              bgcolor: 'background.paper',
                              color: 'text.primary',
                              fontWeight: 500,
                              '& .MuiChip-icon': { ml: 1 },
                              transition: 'border-color 0.2s ease, background-color 0.2s ease',
                              '&:hover': { borderColor: alpha(tech.color, 0.6), bgcolor: alpha(tech.color, 0.06) },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Quote footer */}
          <motion.div {...item(0.68)}>
            <Box
              component="blockquote"
              sx={{
                m: 0,
                mt: { xs: 4, md: 5 },
                pt: 3,
                borderTop: '1px solid var(--app-palette-divider)',
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
              }}
            >
              <Box
                aria-hidden
                component="span"
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '2.75rem',
                  lineHeight: 0.8,
                  color: 'color-mix(in srgb, var(--app-palette-primary-main) 55%, transparent)',
                  userSelect: 'none',
                }}
              >
                &ldquo;
              </Box>
              <Box sx={{ flex: 1, minHeight: 64 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteIndex}
                    initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={reduce ? undefined : { opacity: 0, y: -10, filter: 'blur(6px)' }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    <Typography variant="body1" sx={{ color: 'text.primary', fontStyle: 'italic', lineHeight: 1.6 }}>
                      {quote.text}
                    </Typography>
                    <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                      — {quote.author}
                    </Typography>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Box>
          </motion.div>
        </DetectionFrame>
      </LiquidGlass>
    </Box>
  );
};

export default memo(ModernAbout);
