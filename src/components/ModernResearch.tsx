import React, { memo, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Stack,
  Collapse,
  Link,
  Button,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RESEARCH_PAPERS } from '../constants';

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

const PublicationCard = memo(({ paper, index }: { paper: ResearchPaper; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const descId = `research-desc-${index}`;

  return (
    <Card
      variant="outlined"
      component="article"
      sx={{
        p: { xs: 2, md: 2.5 },
        transition: 'border-color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      {/* Meta row */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="overline"
          sx={{ fontFamily: 'var(--font-mono)', color: 'text.secondary', lineHeight: 1 }}
        >
          {paper.year}
        </Typography>
        <Chip
          label={paper.venueType}
          size="small"
          variant="outlined"
          color={paper.venueType === 'Journal' ? 'primary' : 'default'}
        />
        {paper.scopusIndexed && (
          <Chip label={`Scopus ${paper.scopusIndexed}`} size="small" color="success" variant="outlined" />
        )}
        {paper.isFirstAuthor && (
          <Chip label="First Author" size="small" color="primary" />
        )}
        {paper.citations > 0 && (
          <Chip
            label={`${paper.citations} ${paper.citations === 1 ? 'citation' : 'citations'}`}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>

      {/* Title */}
      <Typography
        variant="subtitle1"
        component="h3"
        sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.5 }}
      >
        {paper.title}
      </Typography>

      {/* Authors */}
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.25 }}>
        {paper.authors}
      </Typography>

      {/* Venue */}
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 1.25 }}
      >
        {paper.venue}
      </Typography>

      {/* Keywords */}
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
        {paper.keywords.map((keyword) => (
          <Chip
            key={keyword}
            label={keyword}
            size="small"
            variant="outlined"
            sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}
          />
        ))}
      </Stack>

      {/* Progressive disclosure */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Typography
          id={descId}
          variant="body2"
          sx={{ color: 'text.primary', opacity: 0.85, lineHeight: 1.65, mt: 0.5, mb: 1 }}
        >
          {paper.description}
        </Typography>
      </Collapse>

      {/* Actions */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}
      >
        <Button
          onClick={() => setExpanded((prev) => !prev)}
          size="small"
          variant="text"
          color="inherit"
          aria-expanded={expanded}
          aria-controls={descId}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transition: 'transform 0.25s ease',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          }
          sx={{
            px: 0.5,
            minWidth: 0,
            textTransform: 'none',
            color: 'text.secondary',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>

        {paper.doi && (
          <Link
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'primary.main',
            }}
          >
            DOI
            <OpenInNewIcon sx={{ fontSize: 13 }} />
          </Link>
        )}
      </Stack>
    </Card>
  );
});

PublicationCard.displayName = 'PublicationCard';

const ModernResearchComponent = () => {
  const papers = useMemo<ResearchPaper[]>(() => RESEARCH_PAPERS as ResearchPaper[], []);
  const firstAuthorCount = useMemo(
    () => papers.filter((p) => p.isFirstAuthor).length,
    [papers],
  );

  return (
    <Box>
      {/* Section header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="overline"
          sx={{ fontFamily: 'var(--font-mono)', color: 'primary.main', letterSpacing: 3 }}
        >
          Research
        </Typography>
        <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mt: 0.5 }}>
          Publications
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          {papers.length} peer-reviewed publications, {firstAuthorCount} as first author.
        </Typography>
      </Box>

      {/* Cards */}
      <Stack spacing={2}>
        {papers.map((paper, index) => (
          <PublicationCard key={`${paper.title}-${index}`} paper={paper} index={index} />
        ))}
      </Stack>
    </Box>
  );
};

const ModernResearch = memo(ModernResearchComponent);
ModernResearch.displayName = 'ModernResearch';

export default ModernResearch;
