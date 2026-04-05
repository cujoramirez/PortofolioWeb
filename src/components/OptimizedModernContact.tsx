import { memo, useRef, useMemo, useCallback, RefObject } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  LocationOn as LocationIcon,
  OpenInNew as OpenInNewIcon,
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { useSystemProfile } from './useSystemProfile';

interface ContactMethod {
  icon: SvgIconComponent;
  label: string;
  value: string;
  href?: string | null;
  isExternal?: boolean;
  color: string;
}

const contactMethods: ContactMethod[] = [
  { icon: EmailIcon, label: 'Email', value: 'gadingadityaperdana@gmail.com', href: 'mailto:gadingadityaperdana@gmail.com', isExternal: false, color: '#3b82f6' },
  { icon: LinkedInIcon, label: 'LinkedIn', value: 'gadingadityaperdana', href: 'https://www.linkedin.com/in/gadingadityaperdana/', isExternal: true, color: '#0a66c2' },
  { icon: GitHubIcon, label: 'GitHub', value: 'cujoramirez', href: 'https://github.com/cujoramirez', isExternal: true, color: '#e6edf3' },
  { icon: SchoolIcon, label: 'Google Scholar', value: 'Gading Aditya Perdana', href: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ', isExternal: true, color: '#4285f4' },
  { icon: LocationIcon, label: 'Location', value: 'Central Jakarta', href: null, color: '#22d3ee' },
];

const ContactCard = memo(({
  method,
  index,
}: {
  method: ContactMethod;
  index: number;
}) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as RefObject<Element>, { once: true, margin: '-30px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const IconComponent = method.icon;

  const handleClick = useCallback(() => {
    if (method.href) window.open(method.href, method.isExternal ? '_blank' : '_self', 'noopener,noreferrer');
  }, [method.href, method.isExternal]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, filter: shouldReduceMotion ? 'none' : 'blur(6px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.45, delay: shouldReduceMotion ? 0 : index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Box
        onClick={method.href ? handleClick : undefined}
        role={method.href ? 'link' : undefined}
        tabIndex={method.href ? 0 : undefined}
        onKeyDown={method.href ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
        aria-label={method.href ? `Open ${method.label}: ${method.value}` : `${method.label}: ${method.value}`}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 1.5,
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          height: '100%',
          background: alpha(theme.palette.background.paper, 0.3),
          border: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
          cursor: method.href ? 'pointer' : 'default',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${method.color}, transparent)`,
            transition: 'width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            borderRadius: '0 0 4px 4px',
          },
          '&:hover': method.href ? {
            background: alpha(theme.palette.background.paper, 0.5),
            borderColor: alpha(method.color, 0.15),
            transform: 'translateY(-5px)',
            boxShadow: `0 16px 48px ${alpha(method.color, 0.08)}, 0 0 0 1px ${alpha(method.color, 0.05)}`,
            '&::before': { width: '80%' },
            '& .contact-card-icon': {
              background: alpha(method.color, 0.12),
              color: method.color,
              boxShadow: `0 0 24px ${alpha(method.color, 0.12)}`,
              transform: 'scale(1.08)',
            },
            '& .contact-card-arrow': { opacity: 1, transform: 'translateX(0)' },
          } : {},
          '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
        }}
      >
        <Box
          className="contact-card-icon"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            background: alpha(method.color, 0.06),
            color: alpha(method.color, 0.6),
            transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
            mb: 0.5,
          }}
        >
          <IconComponent sx={{ fontSize: 22 }} />
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.45),
            fontSize: '0.68rem',
            fontWeight: 500,
            fontFamily: '"JetBrains Mono", monospace',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}
        >
          {method.label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: alpha(theme.palette.text.primary, 0.8),
            fontWeight: 500,
            fontSize: { xs: '0.82rem', md: '0.88rem' },
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {method.value}
        </Typography>

        {method.href && method.isExternal && (
          <Box
            className="contact-card-arrow"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 'auto',
              pt: 0.5,
              opacity: 0.3,
              transform: 'translateX(-4px)',
              transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
              color: method.color,
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 13 }} />
          </Box>
        )}
      </Box>
    </motion.div>
  );
});

ContactCard.displayName = 'ContactCard';

const AvailabilityBadge = memo(() => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.75,
        borderRadius: 10,
        background: alpha('#22c55e', 0.06),
        border: `1px solid ${alpha('#22c55e', 0.1)}`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#22c55e',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `1.5px solid ${alpha('#22c55e', 0.3)}`,
            animation: 'contactPulse 2.5s ease-in-out infinite',
          },
          '@keyframes contactPulse': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.3, transform: 'scale(1.6)' },
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: alpha('#22c55e', 0.8),
          fontWeight: 500,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.68rem',
          letterSpacing: 1,
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        Available for Opportunities
      </Typography>
    </Box>
  );
});

AvailabilityBadge.displayName = 'AvailabilityBadge';

const OptimizedModernContactComponent = () => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <Box
      component="section"
      id="contact"
      ref={sectionRef}
      sx={{ position: 'relative', py: { xs: 10, md: 16 }, overflow: 'hidden' }}
    >
      {/* Background */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-15%',
            left: '-10%',
            width: '50%',
            height: '60%',
            background: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '45%',
            height: '55%',
            background: `radial-gradient(ellipse at center, ${alpha(theme.palette.secondary.main, 0.02)} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          },
        }}
      />

      {/* Subtle grid */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.2,
          backgroundImage: `radial-gradient(${alpha(theme.palette.divider, 0.1)} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 500,
                letterSpacing: 4,
                color: theme.palette.primary.main,
                mb: 2.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                '&::before, &::after': {
                  content: '""',
                  display: 'inline-block',
                  width: 24,
                  height: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.3),
                },
              }}
            >
              Get In Touch
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Let's Connect
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.6),
                maxWidth: 520,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.02rem' },
                lineHeight: 1.7,
                mb: 3,
              }}
            >
              Open to research collaborations, AI engineering roles, and software development opportunities
            </Typography>
            <AvailabilityBadge />
          </Box>
        </motion.div>

        {/* Contact Cards */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 1.5, md: 2 },
            maxWidth: 960,
            mx: 'auto',
            mb: { xs: 6, md: 10 },
          }}
        >
          {contactMethods.map((method, index) => (
            <Box key={method.label} sx={{ width: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 8px)', md: 'calc(20% - 12.8px)' } }}>
              <ContactCard method={method} index={index} />
            </Box>
          ))}
        </Box>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: 780,
              mx: 'auto',
              borderRadius: 4,
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                padding: '1px',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                pointerEvents: 'none',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                gap: { xs: 3, md: 4 },
                p: { xs: 4, md: 5 },
                background: alpha(theme.palette.background.paper, 0.25),
                backdropFilter: 'blur(16px)',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 1.5,
                    fontSize: { xs: '1.2rem', md: '1.35rem' },
                    letterSpacing: '-0.01em',
                  }}
                >
                  Let's Build Something Together
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.text.secondary, 0.6),
                    lineHeight: 1.75,
                    fontSize: { xs: '0.88rem', md: '0.92rem' },
                  }}
                >
                  Currently an Apple Developer Academy Scholar and first-generation undergraduate AI researcher
                  with 5 peer-reviewed publications in computer vision and deep learning.
                </Typography>
              </Box>

              <Box sx={{ flexShrink: 0 }}>
                <Box
                  component="a"
                  href="mailto:gadingadityaperdana@gmail.com"
                  aria-label="Send email to Gading Aditya Perdana"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: { xs: 3, md: 3.5 },
                    py: { xs: 1.5, md: 1.75 },
                    borderRadius: 2.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: theme.palette.primary.contrastText,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontSize: '0.9rem',
                    letterSpacing: '0.02em',
                    transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.35)}, 0 0 60px ${alpha(theme.palette.primary.main, 0.1)}`,
                      '& .cta-arrow': { transform: 'translateX(4px)' },
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  <EmailIcon sx={{ fontSize: 18 }} />
                  Send Email
                  <ArrowForwardIcon className="cta-arrow" sx={{ fontSize: 16, transition: 'transform 0.3s ease', ml: -0.5 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.55 }}
        >
          <Box
            sx={{
              mt: { xs: 8, md: 12 },
              pt: 4,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.35),
                fontSize: '0.76rem',
                letterSpacing: 0.3,
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              © {currentYear} Gading Aditya Perdana
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {contactMethods
                .filter(m => m.href && m.isExternal)
                .map(m => {
                  const Icon = m.icon;
                  return (
                    <Box
                      key={m.label}
                      component="a"
                      href={m.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={m.label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        color: alpha(theme.palette.text.secondary, 0.3),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: m.color,
                          background: alpha(m.color, 0.06),
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 15 }} />
                    </Box>
                  );
                })}
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

const OptimizedModernContact = memo(OptimizedModernContactComponent);
OptimizedModernContact.displayName = 'OptimizedModernContact';

export default OptimizedModernContact;
