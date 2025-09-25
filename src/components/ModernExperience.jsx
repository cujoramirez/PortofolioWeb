import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnterpriseMotion from './animations/EnterpriseMotion';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Container,
  useTheme,
  alpha,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Work as WorkIcon,
  BusinessCenter as BusinessIcon,
  School as SchoolIcon,
  Star as StarIcon,
  OpenInNew as OpenIcon
} from '@mui/icons-material';
import { EXPERIENCES } from '../constants';
import { useSystemProfile } from './useSystemProfile';

// Enhanced experience data with additional modern features
const enhancedExperiences = EXPERIENCES.map((exp, index) => ({
  ...exp,
  id: index,
  icon: index % 3 === 0 ? WorkIcon : index % 3 === 1 ? BusinessIcon : SchoolIcon,
  color: index % 4 === 0 ? 'primary' : index % 4 === 1 ? 'secondary' : index % 4 === 2 ? 'info' : 'success',
  achievements: exp.achievements || [],
  link: exp.link || null
}));


const ModernExperience = memo(() => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const [selectedCard, setSelectedCard] = useState(null);

  const useReducedMotion = performanceTier === 'low';
  const isMobile = useMediaQuery('(max-width:400px)', { noSsr: true });

  return (
    <Box
      component="section"
      id="experience"
      sx={{
        py: { xs: 4, md: 12 },
        position: 'relative',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.02)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            transparent 50%),
            radial-gradient(circle at 80% 20%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 0%, 
            transparent 50%)`,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 0.5, sm: 2 } }}>
        <EnterpriseMotion.ExperienceContainer>
          {/* Section Header */}
          <EnterpriseMotion.ExperienceTitle>
            <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
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
                  mb: 2,
                  position: 'relative'
                }}
              >
                Professional Experience
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                A journey through impactful roles and transformative projects
              </Typography>
            </Box>
          </EnterpriseMotion.ExperienceTitle>

          {/* Experience Timeline */}
          <Box sx={{
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
            minWidth: 0,
          }}>
            <Timeline position={isMobile ? 'right' : 'alternate'} sx={{ minWidth: isMobile ? 320 : 'unset' }}>
              {enhancedExperiences.map((experience, index) => {
                const IconComponent = experience.icon;
                const isLeftColumn = !isMobile && index % 2 === 1;
                
                return (
                  <TimelineItem key={experience.id}>
                      {/* Timeline Date */}
                      {/* Timeline Date (always show on mobile, only in opposite content on md+) */}
                      <TimelineOppositeContent
                        sx={{ 
                          m: 'auto 0',
                          display: { xs: 'none', md: 'block' }
                        }}
                        align={index % 2 === 0 ? 'right' : 'left'}
                        variant="body2"
                        color="text.secondary"
                      >
                        <Typography
                          variant="h6"
                          component="span"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            display: 'block'
                          }}
                        >
                          {experience.year}
                        </Typography>
                      </TimelineOppositeContent>

                      {/* Timeline Separator */}
                      <TimelineSeparator>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TimelineDot
                            color={experience.color}
                            variant="outlined"
                            sx={{
                              p: 1,
                              border: `2px solid ${theme.palette[experience.color].main}`,
                              backgroundColor: alpha(theme.palette[experience.color].main, 0.1)
                            }}
                          >
                            <IconComponent sx={{ fontSize: 20 }} />
                          </TimelineDot>
                        </motion.div>
                        {index < enhancedExperiences.length - 1 && (
                          <TimelineConnector 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.primary.main, 0.3),
                              width: 2
                            }} 
                          />
                        )}
                      </TimelineSeparator>

                      {/* Experience Card */}
                      <TimelineContent sx={{ py: { xs: 1, sm: '12px' }, px: { xs: 0.5, sm: 2 }, minWidth: 0 }}>
                        <EnterpriseMotion.ExperienceCard>
                          <Card
                            elevation={selectedCard === experience.id ? 8 : 2}
                            onClick={() => setSelectedCard(selectedCard === experience.id ? null : experience.id)}
                            sx={{
                              background: selectedCard === experience.id 
                                ? `linear-gradient(135deg, 
                                    ${alpha(theme.palette.primary.main, 0.05)}, 
                                    ${alpha(theme.palette.secondary.main, 0.05)})`
                                : alpha(theme.palette.background.paper, 0.8),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                boxShadow: theme.shadows[8],
                                borderColor: theme.palette.primary.main
                              }
                            }}
                          >
                            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                              {/* Mobile Year Display (always show on xs) */}
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{ 
                                  display: { xs: 'block', md: 'none' },
                                  fontWeight: 600,
                                  mb: 1,
                                  fontSize: { xs: '1rem', sm: '1.1rem' },
                                }}
                              >
                                {experience.year}
                              </Typography>

                              {/* Role and Company */}
                              <Box
                                display="flex"
                                flexDirection={{ xs: 'column', sm: 'row' }}
                                alignItems={{ xs: 'flex-start', sm: isLeftColumn ? 'flex-end' : 'center' }}
                                justifyContent={{ xs: 'flex-start', sm: isLeftColumn ? 'flex-end' : 'space-between' }}
                                textAlign={{ xs: 'left', sm: isLeftColumn ? 'right' : 'left' }}
                                mb={2}
                                gap={1}
                              >
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography
                                    variant="h6"
                                    component="h3"
                                    sx={{
                                      fontWeight: 700,
                                      color: theme.palette.text.primary,
                                      mb: 0.5,
                                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                      textAlign: { xs: 'left', sm: isLeftColumn ? 'right' : 'left' }
                                    }}
                                  >
                                    {experience.role}
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    color="secondary"
                                    sx={{
                                      fontWeight: 500,
                                      fontSize: { xs: '0.95rem', sm: '1rem' },
                                      textAlign: { xs: 'left', sm: isLeftColumn ? 'right' : 'left' }
                                    }}
                                  >
                                    {experience.company}
                                  </Typography>
                                </Box>
                                
                                {experience.link && (
                                  <Tooltip title="Learn more">
                                    <IconButton
                                      component="a"
                                      href={experience.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      size="small"
                                      sx={{ 
                                        color: theme.palette.primary.main,
                                        alignSelf: { xs: 'flex-start', sm: isLeftColumn ? 'flex-end' : 'center' },
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                        }
                                      }}
                                    >
                                      <OpenIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>

                              {/* Description */}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: 2,
                                  lineHeight: 1.6,
                                  fontSize: { xs: '0.95rem', sm: '1rem' },
                                  textAlign: { xs: 'left', sm: isLeftColumn ? 'right' : 'left' }
                                }}
                              >
                                {experience.description}
                              </Typography>

                              {/* Technologies */}
                              <Box mb={2} sx={{ textAlign: { xs: 'left', sm: isLeftColumn ? 'right' : 'left' } }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    mb: 1,
                                    fontWeight: 600,
                                    fontSize: { xs: '0.95rem', sm: '1rem' },
                                    textAlign: { xs: 'left', sm: isLeftColumn ? 'right' : 'left' }
                                  }}
                                >
                                  Technologies
                                </Typography>
                                <Box
                                  display="flex"
                                  flexWrap="wrap"
                                  gap={0.5}
                                  justifyContent={{ xs: 'flex-start', sm: isLeftColumn ? 'flex-end' : 'flex-start' }}
                                >
                                  {experience.technologies.map((tech, techIndex) => (
                                    <Chip
                                      key={tech}
                                      label={tech}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                        color: theme.palette.primary.main,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                        transition: 'transform 0.2s ease, background-color 0.2s ease',
                                        transform: `translateY(${!useReducedMotion ? Math.sin(techIndex) * 0.2 : 0}px)`,
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          borderColor: theme.palette.primary.main,
                                          transform: 'translateY(-1px)'
                                        }
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>

                              {/* Achievements (if expanded) */}
                              <AnimatePresence>
                                {selectedCard === experience.id && experience.achievements && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ mb: 1, fontWeight: 600, mt: 2 }}
                                    >
                                      Key Achievements
                                    </Typography>
                                    {experience.achievements.map((achievement, achIndex) => (
                                      <Box key={achIndex} display="flex" alignItems="flex-start" mb={1}>
                                        <StarIcon 
                                          sx={{ 
                                            fontSize: 16, 
                                            color: theme.palette.warning.main,
                                            mr: 1,
                                            mt: 0.2
                                          }} 
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                          {achievement}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </EnterpriseMotion.ExperienceCard>
                      </TimelineContent>
                    </TimelineItem>
                );
              })}
          </Timeline>
        </Box>
        </EnterpriseMotion.ExperienceContainer>
      </Container>
    </Box>
  );
});

ModernExperience.displayName = 'ModernExperience';

export default ModernExperience;

