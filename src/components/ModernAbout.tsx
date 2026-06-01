import { memo, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Box, Chip, Typography, alpha } from '@mui/material';

import { ABOUT_TEXT, ABOUT_QUOTES } from '../constants/index';
import { technologies, type TechnologyCategory } from './techData';
import LiquidGlass from './LiquidGlass';
import DetectionFrame from './DetectionFrame';

// Order the skill groups for a stable, scannable layout
const CATEGORY_ORDER: TechnologyCategory[] = ['AI/ML', 'Backend', 'Frontend', 'Other'];

// Spec-sheet rows — presentation labels over facts already in the data layer
// (HERO_CONTENT, RESEARCH_PAPERS, the prior GLANCE_FACTS). No data is invented.
const SPEC_FIELDS: { label: string; value: string; detail?: string; tag: string }[] = [
  {
    label: 'FOCUS',
    value: 'Computer Vision · Deep Learning',
    detail: 'Vision Transformers · Ensemble Learning · Model Calibration',
    tag: '0.99',
  },
  { label: 'PUBLICATIONS', value: '5 · 4 first-author', tag: '0.98' },
  { label: 'EDUCATION', value: 'BINUS University · Computer Science', tag: '0.97' },
  { label: 'PROGRAM', value: 'Apple Developer Academy Scholar (2026)', tag: '0.96' },
];

const MONO_LABEL = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  color: 'text.secondary',
} as const;

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

  const prefersReducedMotion = useReducedMotion();
  const reduce = !!prefersReducedMotion;

  // One-shot reveal when the card scrolls into view.
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef as RefObject<HTMLDivElement>, { once: true, margin: '-15% 0px' });

  // Per-section reveal props (static when reduced motion).
  const reveal = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
  });

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

  return (
    <Box ref={rootRef}>
      {/* Section header (outside the card) */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
          Get to know me
        </Typography>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>
          About
        </Typography>
      </Box>

      {/* The dossier card */}
      <LiquidGlass component="div" intensity="subtle" blur={12} radius={20} sx={{ p: { xs: 2.5, md: 4 } }}>
        <DetectionFrame scan active={inView}>
          {/* Header bar */}
          <motion.div {...reveal(0)}>
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
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 20rem)' },
              gap: { xs: 4, md: 5 },
              alignItems: 'start',
            }}
          >
            {/* OVERVIEW */}
            <motion.div {...reveal(1)}>
              <Typography component="div" sx={{ ...MONO_LABEL, mb: 1.5 }}>
                OVERVIEW
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '68ch' }}>
                {paragraphs.map((p, i) => (
                  <Typography
                    key={i}
                    variant={i === 0 ? 'body1' : 'body2'}
                    sx={{ color: i === 0 ? 'text.primary' : 'text.secondary', lineHeight: 1.75 }}
                  >
                    {p}
                  </Typography>
                ))}
              </Box>
            </motion.div>

            {/* Spec sheet */}
            <motion.div {...reveal(2)}>
              <Box component="dl" sx={{ m: 0, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                {SPEC_FIELDS.map((f) => (
                  <DetectionFrame key={f.label} interactive sx={{ px: 1.75, py: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography component="dt" sx={{ ...MONO_LABEL, fontSize: '0.66rem', letterSpacing: '0.18em' }}>
                        {f.label}
                      </Typography>
                      <Box
                        aria-hidden
                        component="span"
                        sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.05em', color: 'var(--df-stroke)' }}
                      >
                        {f.tag}
                      </Box>
                    </Box>
                    <Typography component="dd" sx={{ m: 0, mt: 0.75, color: 'text.primary', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>
                      {f.value}
                    </Typography>
                    {f.detail && (
                      <Typography component="dd" sx={{ m: 0, mt: 0.5, color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {f.detail}
                      </Typography>
                    )}
                  </DetectionFrame>
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* STACK */}
          <motion.div {...reveal(3)}>
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
          <motion.div {...reveal(4)}>
            <Box
              component="blockquote"
              sx={{
                m: 0,
                mt: { xs: 4, md: 5 },
                pt: 3,
                borderTop: '1px solid var(--app-palette-divider)',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <Box aria-hidden component="span" sx={{ ...MONO_LABEL, color: 'color-mix(in srgb, var(--app-palette-primary-main) 70%, transparent)', mt: 0.4 }}>
                // note
              </Box>
              <Box sx={{ flex: 1, minHeight: 64 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteIndex}
                    initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={reduce ? undefined : { opacity: 0, y: -10, filter: 'blur(6px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Typography variant="body1" sx={{ color: 'text.primary', fontStyle: 'italic', lineHeight: 1.6 }}>
                      &ldquo;{quote.text}&rdquo;
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
