import React, { memo, useState, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import EnterpriseMotion from './animations/EnterpriseMotion';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Container,
  Grid,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  useTheme,
  alpha,
  Tooltip,
  Divider,
  Paper,
  Avatar
} from '@mui/material';
import { 
  MenuBook as BookIcon,
  Article as ArticleIcon,
  School as SchoolIcon,
  Launch as LaunchIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  FormatQuote as QuoteIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { RESEARCH_PAPERS } from '../constants';
import { useSystemProfile } from './useSystemProfile';

const ModernResearch = memo(() => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const [selectedPaper, setSelectedPaper] = useState(null);
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const useReducedMotion = performanceTier === 'low';
  const isInteractiveMotion = !useReducedMotion;

  // Parallax transforms for background elements
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  // Animation variants
  const chipVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.9, y: 8 },
    visible: (index = 0) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: 'easeOut',
        delay: isInteractiveMotion ? index * 0.05 : 0
      }
    }),
    hover: {
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2 }
    }
  }), [isInteractiveMotion]);

  const processedPapers = useMemo(() =>
    RESEARCH_PAPERS.map((paper) => {
      const previewKeywords = paper.keywords?.slice(0, 5) ?? [];
      const extraKeywords = Math.max(0, (paper.keywords?.length ?? 0) - previewKeywords.length);
      return { ...paper, previewKeywords, extraKeywords };
    }),
  []);

  const handlePaperClick = useCallback((paper) => {
    setSelectedPaper(paper);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPaper(null);
  }, []);

  return (
    <Box
      ref={sectionRef}
      component="section"
      id="research"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.default, 0.95)} 0%, 
          ${alpha(theme.palette.primary.main, 0.03)} 50%,
          ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        overflow: 'hidden',
        minHeight: '100vh'
      }}
    >
      {/* Animated Background Elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...(isInteractiveMotion ? { y: backgroundY } : {}),
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, 
              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
              transparent 70%)`,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '10%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, 
              ${alpha(theme.palette.secondary.main, 0.1)} 0%, 
              transparent 70%)`,
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
      </motion.div>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <EnterpriseMotion.ResearchContainer>
          {/* Section Header */}
          <EnterpriseMotion.ResearchTitle>
            <Box textAlign="center" mb={{ xs: 6, md: 8 }} sx={{ px: { xs: 1, sm: 0 } }}>
              <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
                <ScienceIcon 
                  sx={{ 
                    fontSize: { xs: 40, md: 50 }, 
                    color: theme.palette.primary.main,
                    mr: { xs: 1, sm: 2 }
                  }} 
                />
                <Typography
                  variant="h2"
                  component="h2"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.main}, 
                      ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    position: 'relative',
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  Research Publications
                </Typography>
              </Box>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}
              >
                Advancing the frontiers of AI and Computer Vision through rigorous research and innovation
              </Typography>
            </Box>
          </EnterpriseMotion.ResearchTitle>

          {/* Research Papers Grid */}
          <Grid container spacing={4}>
            {processedPapers.map((paper, index) => (
              <Grid size={{ xs: 12 }} key={index}>
                <EnterpriseMotion.ResearchCard>
                  <Card
                      elevation={6}
                      sx={{
                        background: `linear-gradient(135deg, 
                          ${alpha(theme.palette.background.paper, 0.9)}, 
                          ${alpha(theme.palette.primary.main, 0.02)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        cursor: 'pointer',
                        transition: 'all 0.4s ease-in-out',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          boxShadow: theme.shadows[20],
                          borderColor: theme.palette.primary.main,
                          '&::before': {
                            opacity: 1
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, 
                            ${alpha(theme.palette.primary.main, 0.05)}, 
                            ${alpha(theme.palette.secondary.main, 0.05)})`,
                          opacity: 0,
                          transition: 'opacity 0.3s ease-in-out',
                          pointerEvents: 'none',
                          borderRadius: 'inherit'
                        }
                      }}
                      onClick={() => handlePaperClick(paper)}
                    >
                      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                        {/* Paper Header */}
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
                          <Box flex={1}>
                            {/* Year Badge */}
                            <Box display="flex" alignItems="center" mb={2}>
                              <Chip
                                icon={<CalendarIcon />}
                                label={paper.year}
                                variant="filled"
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                  mr: 2
                                }}
                              />
                              <Chip
                                icon={<SchoolIcon />}
                                label="Peer Reviewed"
                                variant="outlined"
                                size="small"
                                sx={{
                                  borderColor: alpha(theme.palette.secondary.main, 0.5),
                                  color: theme.palette.secondary.main
                                }}
                              />
                            </Box>

                            {/* Title */}
                            <Typography
                              variant="h5"
                              component="h3"
                              sx={{
                                fontWeight: 700,
                                mb: 2,
                                color: theme.palette.text.primary,
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {paper.title}
                            </Typography>

                            {/* Authors */}
                            <Box display="flex" alignItems="center" mb={2}>
                              <PersonIcon 
                                sx={{ 
                                  fontSize: 20, 
                                  color: theme.palette.text.secondary,
                                  mr: 1 
                                }} 
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: 'italic' }}
                              >
                                {paper.authors}
                              </Typography>
                            </Box>

                            {/* Conference */}
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.secondary.main,
                                mb: 3
                              }}
                            >
                              {paper.conference}
                            </Typography>
                          </Box>

                          {/* Action Icons */}
                          <Box ml={2}>
                            <Tooltip title="View Details">
                              <IconButton
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <ArticleIcon sx={{ color: theme.palette.primary.main }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Description */}
                        <Box mb={3}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ 
                              lineHeight: 1.7,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {paper.description}
                          </Typography>
                        </Box>

                        {/* Keywords */}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1.5, fontWeight: 600 }}
                          >
                            Keywords
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {isInteractiveMotion ? (
                              <AnimatePresence initial={false}>
                                {paper.previewKeywords.map((keyword, keywordIndex) => (
                                  <motion.div
                                    key={keyword}
                                    variants={chipVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    whileHover="hover"
                                    custom={keywordIndex}
                                  >
                                    <Chip
                                      label={keyword}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                        color: theme.palette.primary.main,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        fontSize: '0.75rem',
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          borderColor: theme.palette.primary.main
                                        }
                                      }}
                                    />
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            ) : (
                              paper.previewKeywords.map((keyword) => (
                                <Chip
                                  key={keyword}
                                  label={keyword}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    color: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    fontSize: '0.75rem'
                                  }}
                                />
                              ))
                            )}
                            {paper.extraKeywords > 0 && (
                              <Chip
                                label={`+${paper.extraKeywords} more`}
                                size="small"
                                variant="filled"
                                sx={{
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                </EnterpriseMotion.ResearchCard>
              </Grid>
            ))}
          </Grid>

          {/* Research Statistics */}
          <EnterpriseMotion.ResearchStats>
            <Box mt={8}>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.05)}, 
                    ${alpha(theme.palette.secondary.main, 0.05)})`,
                  // backdropFilter: 'blur(2px)', // Removed
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3} textAlign="center">
                  Research Impact
                </Typography>
                <Grid 
                  container 
                  spacing={4} 
                  justifyContent="center" 
                  alignItems="center"
                  sx={{ maxWidth: '800px', margin: '0 auto' }}
                >
                  <Grid size={{ xs: 6, sm: 3 }} sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {RESEARCH_PAPERS.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Publications
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }} sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="secondary.main">
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      First Author
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }} sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      2025
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest Year
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }} sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="secondary.main">
                      AI/ML
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Research Focus
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </EnterpriseMotion.ResearchStats>
        </EnterpriseMotion.ResearchContainer>
      </Container>

      {/* Research Paper Detail Modal */}
      <Dialog
        open={!!selectedPaper}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: alpha(theme.palette.background.paper, 0.95),
            // backdropFilter: 'blur(3px)', // Removed
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }
        }}
      >
        {selectedPaper && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                pb: 2
              }}
            >
              <Box flex={1}>
                <Typography variant="h5" component="h2" fontWeight={700} mb={1}>
                  {selectedPaper.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPaper.conference} • {selectedPaper.year}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              {/* Authors */}
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Authors
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedPaper.authors}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Abstract */}
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Abstract
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <QuoteIcon 
                    sx={{ 
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      fontSize: 24,
                      color: alpha(theme.palette.primary.main, 0.3)
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                      pl: 2
                    }}
                  >
                    {selectedPaper.description}
                  </Typography>
                </Box>
              </Box>

              {/* Keywords */}
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Keywords
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedPaper.keywords?.map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      variant="filled"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={2} flexWrap="wrap" mt={4}>
                {selectedPaper.pdfLink && (
                  <Button
                    variant="contained"
                    startIcon={<PdfIcon />}
                    component="a"
                    href={selectedPaper.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.dark
                      }
                    }}
                  >
                    View PDF
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<BookIcon />}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  Citation
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
});

ModernResearch.displayName = 'ModernResearch';

export default ModernResearch;

