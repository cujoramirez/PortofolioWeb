import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, Typography, Button, useTheme } from '@mui/material';
import {
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { CONTACT } from '../constants';

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

type ContactMethod = {
  key: string;
  label: string;
  value: string;
  icon: SvgIconComponent;
  href?: string;
  external?: boolean;
};

const CONTACT_METHODS: ContactMethod[] = [
  {
    key: 'email',
    label: 'Email',
    value: CONTACT.email,
    icon: EmailIcon,
    href: `mailto:${CONTACT.email}`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    value: 'gadingadityaperdana',
    icon: LinkedInIcon,
    href: 'https://www.linkedin.com/in/gadingadityaperdana/',
    external: true,
  },
  {
    key: 'github',
    label: 'GitHub',
    value: 'cujoramirez',
    icon: GitHubIcon,
    href: 'https://github.com/cujoramirez',
    external: true,
  },
  {
    key: 'scholar',
    label: 'Google Scholar',
    value: 'Gading Aditya Perdana',
    icon: SchoolIcon,
    href: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ',
    external: true,
  },
  {
    key: 'location',
    label: 'Location',
    value: 'Central Jakarta',
    icon: LocationOnIcon,
  },
];

const OptimizedModernContactComponent = () => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const reveal = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.5, ease: REVEAL_EASE },
      };

  return (
    <Box>
      {/* Heading */}
      <Box
        component={motion.div}
        {...reveal}
        sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}
      >
        <Typography
          variant="overline"
          component="p"
          sx={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: 3,
            color: theme.palette.primary.main,
            display: 'block',
            mb: 1,
          }}
        >
          Get In Touch
        </Typography>
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1.5 }}
        >
          Get in touch
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary, maxWidth: 540, mx: 'auto' }}
        >
          Open to research collaborations, AI engineering roles, and software opportunities.
          The quickest way to reach me is the channels below.
        </Typography>
      </Box>

      {/* Contact methods grid */}
      <Box
        component={motion.div}
        {...reveal}
        sx={{
          maxWidth: 640,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {CONTACT_METHODS.map((method) => {
          const Icon = method.icon;
          const isLink = Boolean(method.href);

          const content = (
            <>
              <Box
                aria-hidden="true"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  color: theme.palette.primary.main,
                  backgroundColor: 'var(--app-palette-action-hover)',
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="overline"
                  component="span"
                  sx={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: 1.5,
                    lineHeight: 1.4,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {method.label}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {method.value}
                </Typography>
              </Box>
            </>
          );

          const baseSx = {
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: { xs: 1.75, sm: 2 },
            borderRadius: 3,
            backgroundColor: 'var(--app-palette-bg-elevated)',
            border: `1px solid ${theme.palette.divider}`,
          } as const;

          if (!isLink) {
            return (
              <Box key={method.key} sx={baseSx}>
                {content}
              </Box>
            );
          }

          return (
            <Box
              key={method.key}
              component="a"
              href={method.href}
              {...(method.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              aria-label={`Open ${method.label}: ${method.value}`}
              sx={{
                ...baseSx,
                textDecoration: 'none',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              {content}
            </Box>
          );
        })}
      </Box>

      {/* Primary action */}
      <Box
        component={motion.div}
        {...reveal}
        sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 } }}
      >
        <Button
          variant="contained"
          size="large"
          href={`mailto:${CONTACT.email}`}
          startIcon={<EmailIcon sx={{ fontSize: 18 }} />}
          sx={{ px: 3 }}
        >
          Email me
        </Button>
      </Box>
    </Box>
  );
};

const OptimizedModernContact = memo(OptimizedModernContactComponent);
OptimizedModernContact.displayName = 'OptimizedModernContact';

export default OptimizedModernContact;
