import { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Chip, Typography, useTheme, alpha } from '@mui/material';

import { ABOUT_TEXT, ABOUT_QUOTES } from '../constants/index';
import { technologies, type TechnologyCategory } from './techData';

// Order the skill groups for a stable, scannable layout
const CATEGORY_ORDER: TechnologyCategory[] = ['AI/ML', 'Backend', 'Frontend', 'Other'];

// "At a glance" — only facts already present in the site copy/data
const GLANCE_FACTS = [
  'Apple Developer Academy Scholar (2026)',
  'Computer Vision & Deep Learning',
  '5 publications',
  'BINUS University · Computer Science',
];

const ModernAbout = () => {
  const theme = useTheme();

  const paragraphs = useMemo(
    () => ABOUT_TEXT.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    [],
  );

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: technologies.filter((t) => t.category === category),
    })).filter((g) => g.items.length > 0);
  }, []);

  // Lightweight rotating quote (single quote visible at a time)
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    if (ABOUT_QUOTES.length <= 1) return;
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % ABOUT_QUOTES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);
  const quote = ABOUT_QUOTES[quoteIndex];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 5, md: 7 } }}>
      {/* Heading */}
      <Box>
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', display: 'block', mb: 1 }}
        >
          Get to know me
        </Typography>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>
          About
        </Typography>
      </Box>

      {/* Two-up: prose + at-a-glance */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 68ch) 1fr' },
          gap: { xs: 4, md: 6 },
          alignItems: 'start',
        }}
      >
        {/* Prose */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: '68ch' }}>
          {paragraphs.map((p, i) => (
            <Typography
              key={i}
              variant={i === 0 ? 'body1' : 'body2'}
              sx={{
                color: i === 0 ? 'text.primary' : 'text.secondary',
                lineHeight: 1.75,
              }}
            >
              {p}
            </Typography>
          ))}
        </Box>

        {/* At a glance */}
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography
            component="li"
            variant="overline"
            sx={{ color: 'text.secondary', mb: 0.5 }}
          >
            At a glance
          </Typography>
          {GLANCE_FACTS.map((fact) => (
            <Box
              key={fact}
              component="li"
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}
            >
              <Box
                aria-hidden
                sx={{
                  mt: '0.45em',
                  width: 6,
                  height: 6,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {fact}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Skills band */}
      <Box>
        <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 2.5 }}>
          Technologies &amp; tools
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {grouped.map(({ category, items }) => (
            <Box
              key={category}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' },
                gap: { xs: 1, sm: 2.5 },
                alignItems: 'start',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  pt: { sm: 0.75 },
                }}
              >
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {items.map((tech) => {
                  const Icon = tech.icon;
                  return (
                    <Chip
                      key={tech.name}
                      icon={
                        <Box
                          component={Icon}
                          aria-hidden
                          sx={{ color: `${tech.color} !important`, fontSize: '1rem' }}
                        />
                      }
                      label={tech.name}
                      variant="outlined"
                      sx={{
                        borderColor: alpha(theme.palette.divider, 0.4),
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        fontWeight: 500,
                        '& .MuiChip-icon': { ml: 1 },
                        transition: 'border-color 0.2s ease, background-color 0.2s ease',
                        '&:hover': {
                          borderColor: alpha(tech.color, 0.6),
                          bgcolor: alpha(tech.color, 0.06),
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Quote */}
      <Box
        component="blockquote"
        sx={{
          m: 0,
          pl: 2.5,
          borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
          minHeight: 88,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography
              variant="body1"
              sx={{ color: 'text.primary', fontStyle: 'italic', lineHeight: 1.6 }}
            >
              &ldquo;{quote.text}&rdquo;
            </Typography>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
            >
              — {quote.author}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default memo(ModernAbout);
