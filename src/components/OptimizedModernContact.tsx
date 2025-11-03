import {
  memo,
  useRef,
  useMemo,
  useCallback,
  type RefObject,
} from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import {
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  LocationOn as LocationIcon,
  ContactMail as ContactIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useSystemProfile } from './useSystemProfile';
import { useReducedMotionOverride } from '../hooks/useReducedMotionOverride';
import ScrollFloat from './ScrollFloat';
import Orb from './Orb';

type ContactMethod = {
  icon: SvgIconComponent;
  label: string;
  value: string;
  href?: string | null;
  color: string;
  description: string;
};

type Stat = {
  icon: SvgIconComponent;
  value: string;
  label: string;
};

type Expertise = {
  label: string;
  color: string;
};

const contactMethods: ContactMethod[] = [
  {
    icon: EmailIcon,
    label: 'Email',
    value: 'gadingadityaperdana@gmail.com',
    href: 'mailto:gadingadityaperdana@gmail.com',
    color: '#6366f1',
    description: 'Best for detailed inquiries',
  },
  {
    icon: LinkedInIcon,
    label: 'LinkedIn',
    value: 'gadingadityaperdana',
    href: 'https://www.linkedin.com/in/gadingadityaperdana/',
    color: '#0077b5',
    description: 'Professional networking',
  },
  {
    icon: GitHubIcon,
    label: 'GitHub',
    value: 'cujoramirez',
    href: 'https://github.com/cujoramirez',
    color: '#333',
    description: 'View my code repositories',
  },
  {
    icon: LocationIcon,
    label: 'Location',
    value: 'Central Jakarta, Indonesia',
    href: null,
    color: '#10b981',
    description: 'Available globally for remote work',
  },
];

const stats: Stat[] = [
  { icon: WorkIcon, value: '3', label: 'Years Experience' },
  { icon: BusinessIcon, value: '14', label: 'Projects Completed' },
  { icon: AnalyticsIcon, value: '24/7', label: 'Availability' },
  { icon: ScienceIcon, value: 'AI/ML', label: 'Specialization' },
];

const expertise: Expertise[] = [
  { label: 'AI Strategy', color: '#6366f1' },
  { label: 'Machine Learning', color: '#8b5cf6' },
  { label: 'Full-Stack Development', color: '#f59e0b' },
  { label: 'Data Analytics', color: '#ef4444' },
];

const itemVariants: Variants = {
  hover: { scale: 1.02 },
};

type OptimizedBackgroundProps = {
  theme: Theme;
  shouldAnimate: boolean;
};

const OptimizedBackground = memo(({ theme, shouldAnimate }: OptimizedBackgroundProps) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
    }}
  >
    {/* Orb Background */}
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '500px', md: '700px', lg: '900px' },
        height: { xs: '500px', md: '700px', lg: '900px' },
        opacity: 1,
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }}
    >
      <Orb
        hue={240}
        hoverIntensity={0.3}
        rotateOnHover={shouldAnimate}
        forceHoverState={false}
      />
    </Box>
    
    {/* Gradient Overlays */}
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 50%)
        `,
      }}
    />
  </Box>
));
OptimizedBackground.displayName = 'OptimizedBackground';

type ContactMethodCardProps = {
  method: ContactMethod;
  index: number;
  theme: Theme;
  shouldAnimate: boolean;
};

const ContactMethodCard = memo(({ method, index, theme, shouldAnimate }: ContactMethodCardProps) => {
  const IconComponent = method.icon;

  const handleClick = useCallback(() => {
    if (method.href) {
      window.open(method.href, '_blank', 'noopener,noreferrer');
    }
  }, [method.href]);

  return (
    <motion.div
      key={method.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={shouldAnimate ? { 
        scale: 1.02, 
        y: -2,
        transition: { type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }
      } : undefined}
      transition={{ 
        type: 'spring', 
        stiffness: 450, 
        damping: 30, 
        mass: 0.5,
        opacity: { duration: 0.3, delay: index * 0.08 },
        y: { duration: 0.3, delay: index * 0.08 }
      }}
      style={{ 
        display: 'flex', 
        width: '100%', 
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      <Card
        elevation={3}
        sx={{
          p: 3,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          background: alpha(theme.palette.background.paper, 0.78),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          backdropFilter: 'blur(14px)',
          cursor: method.href ? 'pointer' : 'default',
          borderRadius: 3,
          boxShadow: '0 24px 40px rgba(15, 23, 42, 0.18)',
          '&:hover': method.href
            ? {
                borderColor: alpha(method.color, 0.4),
                boxShadow: '0 28px 50px rgba(99, 102, 241, 0.25)',
                transform: 'translateY(-4px) scale(1.01)',
                '& .contact-icon': {
                  color: method.color,
                  transform: 'scale(1.12)',
                },
              }
            : {},
        }}
        onClick={handleClick}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: alpha(method.color, 0.15),
              color: method.color,
              width: 52,
              height: 52,
              boxShadow: `0 12px 24px ${alpha(method.color, 0.25)}`,
            }}
          >
            <IconComponent
              className="contact-icon"
              sx={{
                fontSize: 26,
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform',
              }}
            />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
              {method.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {method.description}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body1"
          color="text.primary"
          fontWeight={600}
          sx={{ wordBreak: 'break-word', fontSize: '1.05rem' }}
        >
          {method.value}
        </Typography>
      </Card>
    </motion.div>
  );
});
ContactMethodCard.displayName = 'ContactMethodCard';

type StatCardProps = {
  stat: Stat;
  index: number;
  theme: Theme;
  shouldAnimate: boolean;
};

const StatCard = memo(({ stat, index: _index, theme, shouldAnimate }: StatCardProps) => {
  const IconComponent = stat.icon;

  return (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.5 }}
      style={{ width: '100%' }}
    >
      <Box
        textAlign="center"
        sx={{
          p: { xs: 2.5, sm: 3 },
          background: alpha(theme.palette.background.paper, 0.08),
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          transition: shouldAnimate ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, box-shadow 0.2s ease' : 'none',
          willChange: shouldAnimate ? 'transform, border-color, box-shadow' : 'auto',
          boxShadow: '0 20px 30px rgba(15, 23, 42, 0.16)',
          '&:hover': shouldAnimate
            ? {
                borderColor: alpha(theme.palette.primary.main, 0.35),
                transform: 'translateY(-3px)',
                boxShadow: '0 26px 36px rgba(99, 102, 241, 0.22)',
              }
            : {},
        }}
      >
        <IconComponent
          sx={{
            fontSize: { xs: 28, sm: 34 },
            color: theme.palette.primary.main,
            mb: 1,
          }}
        />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            fontSize: { xs: '1.6rem', sm: '2.1rem' },
            color: theme.palette.primary.main,
            mb: 0.5,
          }}
        >
          {stat.value}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
        >
          {stat.label}
        </Typography>
      </Box>
    </motion.div>
  );
});
StatCard.displayName = 'StatCard';

type ExpertiseChipProps = {
  item: Expertise;
  index: number;
  shouldAnimate: boolean;
};

const ExpertiseChip = memo(({ item, index: _index, shouldAnimate }: ExpertiseChipProps) => (
  <motion.div
    key={item.label}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
    style={{ 
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    }}
  >
    <Chip
      label={item.label}
      variant="outlined"
      sx={{
        borderColor: alpha(item.color, 0.3),
        color: item.color,
        backgroundColor: alpha(item.color, 0.05),
        fontWeight: 600,
        fontSize: '0.875rem',
        height: 40,
        px: 2,
        transition: shouldAnimate ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease' : 'none',
        willChange: shouldAnimate ? 'transform' : 'auto',
        '&:hover': shouldAnimate
          ? {
              backgroundColor: alpha(item.color, 0.12),
              borderColor: alpha(item.color, 0.5),
              transform: 'scale(1.05)',
            }
          : {},
      }}
    />
  </motion.div>
));
ExpertiseChip.displayName = 'ExpertiseChip';

const OptimizedModernContact = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const prefersReducedMotion = useReducedMotionOverride();
  const { performanceTier } = useSystemProfile();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerRefForInView = containerRef as RefObject<Element>;
  const isInView = useInView(containerRefForInView, { once: true, amount: 0.1 });

  const shouldAnimate = !prefersReducedMotion && performanceTier !== 'low' && !isMobile;
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const memoizedContactMethods = useMemo(() => contactMethods, []);
  const memoizedStats = useMemo(() => stats, []);
  const memoizedExpertise = useMemo(() => expertise, []);

  return (
    <Box
      ref={containerRef}
      component="section"
      id="contact"
      sx={{
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg,
          ${theme.palette.background.default} 0%,
          ${alpha(theme.palette.primary.main, 0.02)} 50%,
          ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        color: 'white',
      }}
    >
      <OptimizedBackground theme={theme} shouldAnimate={shouldAnimate} />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {isInView && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
              <Chip
                icon={<ContactIcon />}
                label="Get In Touch"
                sx={{
                  mb: 3,
                  background: `linear-gradient(135deg,
                    ${alpha(theme.palette.primary.main, 0.1)},
                    ${alpha(theme.palette.secondary.main, 0.1)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 1,
                  px: 2,
                }}
              />

              <ScrollFloat
                as="h2"
                containerClassName="my-0"
                containerStyle={{ marginBottom: theme.spacing(2) }}
                textClassName="font-extrabold"
                textStyle={{
                  fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
                  background: 'linear-gradient(135deg, #6b7cff 0%, #a855f7 50%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.2,
                  display: 'inline-block',
                }}
              >
                Let's Work Together
              </ScrollFloat>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.6,
                }}
              >
                Ready to bring your ideas to life with cutting-edge AI and development solutions
              </Typography>
            </Box>
          </motion.div>
        )}

        <Box mb={{ xs: 6, md: 8 }} sx={{ width: '100%' }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 4, color: theme.palette.text.primary }}
          >
            Contact Methods
          </Typography>

          <Box
            sx={{
              maxWidth: 1080,
              mx: 'auto',
              display: 'grid',
              gap: { xs: 2.5, md: 3 },
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              justifyItems: 'stretch',
            }}
          >
            {memoizedContactMethods.map((method, index) => {
              const isLocation = method.label === 'Location';

              return (
                <Box
                  key={method.label}
                  sx={{
                    display: 'flex',
                    gridColumn: isLocation
                      ? {
                          xs: 'auto',
                          sm: '1 / span 2',
                          lg: '2 / span 1',
                        }
                      : 'auto',
                    justifySelf: isLocation ? 'center' : 'stretch',
                    maxWidth: isLocation ? { xs: '100%', sm: 420, lg: '100%' } : '100%',
                  }}
                >
                  <ContactMethodCard
                    method={method}
                    index={index}
                    theme={theme}
                    shouldAnimate={shouldAnimate}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box mb={{ xs: 6, md: 8 }} sx={{ width: '100%' }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 4, color: theme.palette.text.primary }}
          >
            Quick Stats
          </Typography>

          <Box
            sx={{
              maxWidth: 960,
              mx: 'auto',
              display: 'grid',
              gap: { xs: 2, sm: 2.5 },
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 180px))',
                md: 'repeat(4, minmax(0, 200px))',
              },
              justifyContent: 'center',
              justifyItems: 'center',
            }}
          >
            {memoizedStats.map((stat, index) => (
              <StatCard
                key={stat.label}
                stat={stat}
                index={index}
                theme={theme}
                shouldAnimate={shouldAnimate}
              />
            ))}
          </Box>
        </Box>

        <Box textAlign="center" sx={{ width: '100%' }}>
          <Typography
            variant="h4"
            fontWeight={600}
            sx={{ mb: 4, color: theme.palette.text.primary }}
          >
            Areas of Expertise
          </Typography>

          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            gap={1.5}
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            {memoizedExpertise.map((item, index) => (
              <ExpertiseChip
                key={item.label}
                item={item}
                index={index}
                shouldAnimate={shouldAnimate}
              />
            ))}
          </Box>
        </Box>

        <Box
          component={motion.div}
          variants={itemVariants}
          whileHover={prefersReducedMotion ? undefined : 'hover'}
          sx={{
            textAlign: 'center',
            mt: { xs: 6, md: 8 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.95rem' }}
          >
            © {currentYear} Gading Aditya Perdana. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
});
OptimizedModernContact.displayName = 'OptimizedModernContact';

export default OptimizedModernContact;
