import {
  memo,
  useState,
  useRef,
  useMemo,
  useCallback,
  type ComponentType,
  type PropsWithChildren,
  type RefObject,
  type ReactElement,
} from 'react';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
  type MotionValue,
} from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Container,
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
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Article as ArticleIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  FormatQuote as QuoteIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { RESEARCH_PAPERS } from '../constants';
import { useSystemProfile } from './useSystemProfile';
import ScrollFloat from './ScrollFloat';
import EnterpriseMotionLibrary from './animations/EnterpriseMotion';

const MODAL_WIDTH = 'md';
const KEYWORD_FONT_SIZE = '0.75rem';
const CHIP_HOVER_OFFSET = -2;

const motionComponents = EnterpriseMotionLibrary as Record<
  string,
  ComponentType<PropsWithChildren<Record<string, unknown>>>
>;

const ResearchContainer = motionComponents.ResearchContainer ?? (({ children }) => <>{children}</>);
const ResearchTitle = motionComponents.ResearchTitle ?? (({ children }) => <>{children}</>);
const ResearchCard = motionComponents.ResearchCard ?? (({ children }) => <>{children}</>);
const ResearchStats = motionComponents.ResearchStats ?? (({ children }) => <>{children}</>);

export type ResearchPaper = {
  year: string;
  title: string;
  authors: string;
  conference: string;
  description: string;
  keywords?: string[];
  pdfLink?: string;
};

type ProcessedResearchPaper = ResearchPaper & {
  previewKeywords: string[];
  extraKeywords: number;
};

const ModernResearchComponent = () => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef as RefObject<HTMLElement>,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const shouldReduceMotion = performanceTier === 'low';
  const isInteractiveMotion = !shouldReduceMotion;

  const chipVariants = useMemo<Variants>(() => {
    const baseVariant: Variants = {
      hidden: { opacity: 0, scale: 0.9, y: 8, transition: { type: 'spring', stiffness: 500, damping: 30, mass: 0.5 } },
      visible: (index = 0) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.2,
          ease: 'easeOut',
          delay: isInteractiveMotion ? index * 0.04 : 0,
        },
      }),
      hover: {
        scale: 1.05,
        y: CHIP_HOVER_OFFSET,
        transition: { type: 'spring', stiffness: 600, damping: 25, mass: 0.4 },
      },
    };

    return baseVariant as Variants;
  }, [isInteractiveMotion]);

  const processedPapers = useMemo<ProcessedResearchPaper[]>(() => {
    const papers = RESEARCH_PAPERS as ResearchPaper[];

    return papers.map((paper) => {
      const previewKeywords = paper.keywords?.slice(0, 5) ?? [];
      const extraKeywords = Math.max(0, (paper.keywords?.length ?? 0) - previewKeywords.length);

      return { ...paper, previewKeywords, extraKeywords };
    });
  }, []);

  const handlePaperClick = useCallback((paper: ResearchPaper) => {
    setSelectedPaper(paper);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPaper(null);
  }, []);

  const backgroundMotionStyle = useMemo<Partial<Record<'y', MotionValue<string>>>>(() => {
    if (!isInteractiveMotion) {
      return {};
    }

    return { y: backgroundY };
  }, [backgroundY, isInteractiveMotion]);

  const renderKeywordChip = useCallback(
    (keyword: string) => (
      <Chip
        key={keyword}
        label={keyword}
        size="small"
        variant="outlined"
        sx={{
          borderColor: alpha(theme.palette.primary.main, 0.3),
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          fontSize: KEYWORD_FONT_SIZE,
          '&:hover': {
            willChange: 'transform',
          },
        }}
      />
    ),
    [theme.palette.primary.main],
  );

  const renderKeywordMotionChip = useCallback(
    (keyword: string, keywordIndex: number) => (
      <motion.div
        key={keyword}
        variants={chipVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        whileHover="hover"
        custom={keywordIndex}
      >
        {renderKeywordChip(keyword)}
      </motion.div>
    ),
    [chipVariants, renderKeywordChip],
  );

  const decorativeBackground = useMemo<ReactElement[]>(
    () => [
      <Box
        key="primary-glow"
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          animation: 'float 6s ease-in-out infinite',
        }}
      />,
      <Box
        key="secondary-glow"
        sx={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />,
    ],
    [theme.palette.primary.main, theme.palette.secondary.main],
  );

  return (
    <Box
      ref={sectionRef}
      component="section"
      id="research"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 50%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        overflow: 'hidden',
        minHeight: '100vh',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          ...backgroundMotionStyle,
        }}
      >
        {decorativeBackground}
      </motion.div>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <ResearchContainer>
          <ResearchTitle>
            <Box textAlign="center" mb={{ xs: 6, md: 8 }} sx={{ px: { xs: 1, sm: 0 } }}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={2}
                sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}
              >
                <ScienceIcon
                  sx={{
                    fontSize: { xs: 40, md: 50 },
                    color: theme.palette.primary.main,
                    mr: { xs: 1, sm: 2 },
                  }}
                />
                <ScrollFloat
                  as="h2"
                  containerClassName="my-0"
                  textClassName="font-extrabold"
                  containerStyle={{ width: '100%' }}
                  textStyle={{
                    fontSize: 'clamp(2.8rem, 6.4vw, 4rem)',
                    background: 'linear-gradient(135deg, #6b7cff 0%, #a855f7 50%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textAlign: 'center',
                    display: 'inline-block',
                    fontWeight: 800,
                  }}
                >
                  Research Publications
                </ScrollFloat>
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}>
                Advancing the frontiers of AI and Computer Vision through rigorous research and innovation
              </Typography>
            </Box>
          </ResearchTitle>

          <Box display="flex" flexDirection="column" gap={4}>
            {processedPapers.map((paper, index) => (
              <Box key={paper.title ?? index}>
                <ResearchCard>
                  <Card
                    elevation={6}
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.main, 0.02)})`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      willChange: 'box-shadow, border-color',
                      '&:hover': {
                        boxShadow: theme.shadows[20],
                        borderColor: theme.palette.primary.main,
                        '&::before': {
                          opacity: 1,
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                        pointerEvents: 'none',
                        borderRadius: 'inherit',
                      },
                    }}
                    onClick={() => handlePaperClick(paper)}
                  >
                    <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
                        <Box flex={1}>
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
                                mr: 2,
                              }}
                            />
                            <Chip
                              icon={<SchoolIcon />}
                              label="Peer Reviewed"
                              variant="outlined"
                              size="small"
                              sx={{
                                borderColor: alpha(theme.palette.secondary.main, 0.5),
                                color: theme.palette.secondary.main,
                              }}
                            />
                          </Box>

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
                              overflow: 'hidden',
                            }}
                          >
                            {paper.title}
                          </Typography>

                          <Box display="flex" alignItems="center" mb={2}>
                            <PersonIcon sx={{ fontSize: 20, color: theme.palette.text.secondary, mr: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {paper.authors}
                            </Typography>
                          </Box>

                          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.secondary.main, mb: 3 }}>
                            {paper.conference}
                          </Typography>
                        </Box>

                        <Box ml={2}>
                          <Tooltip title="View Details">
                            <IconButton
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <ArticleIcon sx={{ color: theme.palette.primary.main }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Box mb={3}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.7,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {paper.description}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                          Keywords
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {isInteractiveMotion ? (
                            <AnimatePresence initial={false}>
                              {paper.previewKeywords.map((keyword, keywordIndex) =>
                                renderKeywordMotionChip(keyword, keywordIndex),
                              )}
                            </AnimatePresence>
                          ) : (
                            paper.previewKeywords.map((keyword) => renderKeywordChip(keyword))
                          )}
                          {paper.extraKeywords > 0 && (
                            <Chip
                              label={`+${paper.extraKeywords} more`}
                              size="small"
                              variant="filled"
                              sx={{
                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                                fontSize: KEYWORD_FONT_SIZE,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </ResearchCard>
              </Box>
            ))}
          </Box>

          <ResearchStats>
            <Box mt={8}>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3} textAlign="center">
                  Research Impact
                </Typography>
                <Box
                  display="grid"
                  gap={4}
                  gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }}
                  justifyItems="center"
                  sx={{ width: '100%', maxWidth: '800px', mx: 'auto' }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {(RESEARCH_PAPERS as ResearchPaper[]).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Publications
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="secondary.main">
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      First Author
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      2025
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest Year
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="secondary.main">
                      AI/ML
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Research Focus
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </ResearchStats>
        </ResearchContainer>
      </Container>

      <Dialog
        open={Boolean(selectedPaper)}
        onClose={handleCloseModal}
        maxWidth={MODAL_WIDTH}
        fullWidth
        PaperProps={{
          sx: {
            background: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          },
        }}
      >
        {selectedPaper && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                pb: 2,
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
              <Box mb={3}>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Authors
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedPaper.authors}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

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
                      color: alpha(theme.palette.primary.main, 0.3),
                    }}
                  />
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: 'italic', pl: 2 }}>
                    {selectedPaper.description}
                  </Typography>
                </Box>
              </Box>

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
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </Box>

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
                        backgroundColor: theme.palette.error.dark,
                      },
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
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
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
};

const ModernResearch = memo(ModernResearchComponent);

ModernResearch.displayName = 'ModernResearch';

export default ModernResearch;
