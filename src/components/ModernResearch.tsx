import React, { memo, useMemo, useRef, RefObject } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, useInView } from 'framer-motion';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SchoolIcon from '@mui/icons-material/School';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { RESEARCH_PAPERS } from '../constants';
import { useSystemProfile } from './useSystemProfile';

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

// Publication Card Component
const PublicationCard = memo(({
  paper,
  index,
}: {
  paper: ResearchPaper;
  index: number;
}) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef as RefObject<Element>, { once: true, margin: '-50px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Box
        sx={{
          position: 'relative',
          p: { xs: 2.5, md: 3.5 },
          mb: 2.5,
          borderRadius: 2.5,
          background: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 16px 32px ${alpha(theme.palette.common.black, 0.08)}`,
            borderColor: alpha(theme.palette.primary.main, 0.15),
          },
        }}
      >
        {/* Header Row: Badges + Year */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          {paper.isFirstAuthor && (
            <Chip
              label="First Author"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                background: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: 'none',
              }}
            />
          )}
          {paper.scopusIndexed && (
            <Chip
              label={`Scopus ${paper.scopusIndexed}`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                background: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                border: 'none',
              }}
            />
          )}
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              ml: 'auto',
            }}
          >
            {paper.year}
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component={paper.doi ? 'a' : 'span'}
          href={paper.doi ? `https://doi.org/${paper.doi}` : undefined}
          target={paper.doi ? '_blank' : undefined}
          rel={paper.doi ? 'noopener noreferrer' : undefined}
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1rem', md: '1.1rem' },
            color: theme.palette.text.primary,
            mb: 1,
            lineHeight: 1.4,
            display: 'block',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            ...(paper.doi && {
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }),
          }}
        >
          {paper.title}
          {paper.doi && (
            <OpenInNewIcon 
              sx={{ 
                fontSize: 14, 
                ml: 0.75, 
                verticalAlign: 'middle',
                opacity: 0.5,
              }} 
            />
          )}
        </Typography>

        {/* Authors */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.85rem',
            mb: 0.75,
          }}
        >
          {paper.authors}
        </Typography>

        {/* Venue */}
        <Typography
          variant="body2"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.8),
            fontSize: '0.8rem',
            fontStyle: 'italic',
            mb: 1.5,
          }}
        >
          {paper.venue}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: alpha(theme.palette.text.primary, 0.7),
            fontSize: '0.875rem',
            lineHeight: 1.65,
            mb: 2,
          }}
        >
          {paper.description}
        </Typography>

        {/* Keywords + Citations */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {paper.keywords.slice(0, 4).map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  background: alpha(theme.palette.text.primary, 0.04),
                  color: theme.palette.text.secondary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Box>
          
          {paper.citations > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FormatQuoteIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {paper.citations} {paper.citations === 1 ? 'citation' : 'citations'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
});

PublicationCard.displayName = 'PublicationCard';

// Main Component
const ModernResearchComponent = () => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const papers = useMemo<ResearchPaper[]>(() => RESEARCH_PAPERS as ResearchPaper[], []);

  // Calculate stats
  const stats = useMemo(() => {
    const firstAuthorCount = papers.filter(p => p.isFirstAuthor).length;
    const totalCitations = papers.reduce((sum, p) => sum + p.citations, 0);
    
    return {
      total: papers.length,
      firstAuthor: firstAuthorCount,
      citations: totalCitations,
    };
  }, [papers]);

  return (
    <Box
      component="section"
      id="research"
      ref={sectionRef}
      sx={{
        position: 'relative',
        py: { xs: 10, md: 16 },
        background: theme.palette.background.default,
        overflow: 'hidden',
      }}
    >
      {/* Subtle background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.015)} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 600,
                letterSpacing: 3,
                color: theme.palette.primary.main,
                fontSize: '0.8rem',
                mb: 2,
                display: 'block',
              }}
            >
              Academic Research
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.25rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2,
              }}
            >
              Publications
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 520,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.6,
              }}
            >
              {stats.total} peer-reviewed publications · {stats.firstAuthor} first-author papers
              {stats.citations > 0 && ` · ${stats.citations} citations`}
            </Typography>

            {/* Decorative line */}
            <Box
              sx={{
                width: 48,
                height: 2,
                mx: 'auto',
                mt: 3,
                borderRadius: 1,
                background: theme.palette.primary.main,
              }}
            />
          </Box>
        </motion.div>

        {/* Google Scholar Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 5 } }}>
            <Box
              component="a"
              href="https://scholar.google.com/citations?user=hwbWuI0AAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                background: alpha(theme.palette.background.paper, 0.5),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textDecoration: 'none',
                color: theme.palette.text.primary,
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: alpha(theme.palette.primary.main, 0.08),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <SchoolIcon sx={{ fontSize: 18 }} />
              Google Scholar
              <OpenInNewIcon sx={{ fontSize: 14, opacity: 0.6 }} />
            </Box>
          </Box>
        </motion.div>

        {/* Publications List */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {papers.map((paper, index) => (
            <PublicationCard
              key={`${paper.title}-${index}`}
              paper={paper}
              index={index}
            />
          ))}
        </Box>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: alpha(theme.palette.text.secondary, 0.7),
              fontSize: '0.8rem',
              fontStyle: 'italic',
              mt: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Research self-funded · ICCSCI acceptance rate ≈26% · ISRITI acceptance rate ≈30%
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

const ModernResearch = memo(ModernResearchComponent);
ModernResearch.displayName = 'ModernResearch';

export default ModernResearch;
