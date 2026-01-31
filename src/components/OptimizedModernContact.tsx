import React, { memo, useRef, useMemo, useCallback, RefObject } from 'react';
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
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { useSystemProfile } from './useSystemProfile';

interface ContactMethod {
  icon: SvgIconComponent;
  label: string;
  value: string;
  href?: string | null;
  isExternal?: boolean;
}

const contactMethods: ContactMethod[] = [
  {
    icon: EmailIcon,
    label: 'Email',
    value: 'gadingadityaperdana@gmail.com',
    href: 'mailto:gadingadityaperdana@gmail.com',
    isExternal: false,
  },
  {
    icon: LinkedInIcon,
    label: 'LinkedIn',
    value: 'gadingadityaperdana',
    href: 'https://www.linkedin.com/in/gadingadityaperdana/',
    isExternal: true,
  },
  {
    icon: GitHubIcon,
    label: 'GitHub',
    value: 'cujoramirez',
    href: 'https://github.com/cujoramirez',
    isExternal: true,
  },
  {
    icon: SchoolIcon,
    label: 'Google Scholar',
    value: 'Gading Aditya Perdana',
    href: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ',
    isExternal: true,
  },
  {
    icon: LocationIcon,
    label: 'Location',
    value: 'Central Jakarta, Indonesia',
    href: null,
  },
];

// Contact Link Component
const ContactLink = memo(({
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
    if (method.href) {
      window.open(method.href, method.isExternal ? '_blank' : '_self', 'noopener,noreferrer');
    }
  }, [method.href, method.isExternal]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.4,
        delay: shouldReduceMotion ? 0 : index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Box
        onClick={method.href ? handleClick : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          cursor: method.href ? 'pointer' : 'default',
          transition: 'all 0.25s ease',
          '&:hover': method.href ? {
            background: alpha(theme.palette.background.paper, 0.6),
            borderColor: alpha(theme.palette.primary.main, 0.2),
            transform: 'translateX(4px)',
            '& .contact-icon': {
              color: theme.palette.primary.main,
            },
          } : {},
        }}
      >
        <Box
          className="contact-icon"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 1.5,
            background: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.text.secondary,
            transition: 'color 0.25s ease',
          }}
        >
          <IconComponent sx={{ fontSize: 20 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: theme.palette.text.secondary,
              fontSize: '0.7rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              mb: 0.25,
            }}
          >
            {method.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontSize: '0.9rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {method.value}
          </Typography>
        </Box>

        {method.href && method.isExternal && (
          <OpenInNewIcon 
            sx={{ 
              fontSize: 16, 
              color: theme.palette.text.secondary,
              opacity: 0.5,
            }} 
          />
        )}
      </Box>
    </motion.div>
  );
});

ContactLink.displayName = 'ContactLink';

// Main Component
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
      sx={{
        position: 'relative',
        py: { xs: 10, md: 16 },
        background: theme.palette.background.default,
        overflow: 'hidden',
      }}
    >
      {/* Subtle background gradient */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: `linear-gradient(0deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`,
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
              Get In Touch
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
              Let's Connect
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
              Open to research collaborations, AI/ML projects, and full-stack development opportunities
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

        {/* Contact Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
            maxWidth: 900,
            mx: 'auto',
            mb: { xs: 6, md: 10 },
          }}
        >
          {contactMethods.map((method, index) => (
            <ContactLink
              key={method.label}
              method={method}
              index={index}
            />
          ))}
        </Box>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 4, md: 6 },
              maxWidth: 700,
              mx: 'auto',
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.4),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
              }}
            >
              Available for Opportunities
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 3,
                lineHeight: 1.7,
              }}
            >
              Currently seeking research positions, internships, and collaborative projects 
              in AI/ML and computer vision. Self-funded researcher with 5 peer-reviewed publications.
            </Typography>
            <Box
              component="a"
              href="mailto:gadingadityaperdana@gmail.com"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.25s ease',
                '&:hover': {
                  background: theme.palette.primary.dark,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <EmailIcon sx={{ fontSize: 18 }} />
              Send Email
            </Box>
          </Box>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: alpha(theme.palette.text.secondary, 0.6),
              fontSize: '0.8rem',
              mt: { xs: 6, md: 10 },
            }}
          >
            © {currentYear} Gading Aditya Perdana. All rights reserved.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

const OptimizedModernContact = memo(OptimizedModernContactComponent);
OptimizedModernContact.displayName = 'OptimizedModernContact';

export default OptimizedModernContact;
