import { memo, useRef, type CSSProperties, type RefObject } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Box, Link as MuiLink, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import {
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
  OpenInNew as OpenInNewIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

import { CONTACT } from '../constants';
import DetectionFrame from './DetectionFrame';
import LiquidGlass from './LiquidGlass';
import { useSystemProfile } from './useSystemProfile';

// Signature reveal curve (ease-out-quint), typed for framer-motion.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Mono labels: medium weight + an ink-leaning tint so small type stays legible over the
// frosted glass (matches the rest of the shipped sections).
const MONO_LABEL = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  color: 'color-mix(in srgb, var(--app-palette-text-primary) 72%, transparent)',
} as const;

// Steadier glass over the animated background.
const GLASS_TINT = {
  '--lg-tint': 'color-mix(in srgb, var(--app-palette-bg-elevated) 80%, transparent)',
} as CSSProperties;

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

// Glass card hover: lift + deeper shadow, with the trailing icon nudging out. The "opens
// elsewhere" icon (channels) drifts up-right; the "email me" arrow slides forward. Gated.
const glassCardSx: SxProps<Theme> = {
  height: '100%',
  px: { xs: 1.25, md: 1.5 },
  py: { xs: 1.25, md: 1.5 },
  transition:
    'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
  '& .ext-icon, & .ext-arrow': {
    transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), color 0.25s ease',
  },
  '&:hover': { transform: 'translateY(-3px)', '--lg-shadow': '0 16px 40px rgba(0, 0, 0, 0.30)' },
  '&:hover .ext-icon': { transform: 'translate(2px, -2px)', color: 'primary.main' },
  '&:hover .ext-arrow': { transform: 'translateX(3px)' },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '& .ext-icon, & .ext-arrow': { transition: 'color 0.25s ease' },
    '&:hover': { transform: 'none' },
    '&:hover .ext-icon': { transform: 'none', color: 'primary.main' },
    '&:hover .ext-arrow': { transform: 'none' },
  },
};

// Detection brackets rest then lock on under hover (the link fills the frame, so card hover
// drives it via ancestor :hover).
const frameSx: SxProps<Theme> = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 55%, transparent)',
  '@media (hover: hover)': {
    '&:hover': { '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 92%, transparent)' },
  },
};

const linkResetSx: SxProps<Theme> = {
  display: 'block',
  height: '100%',
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: '16px',
  '&:focus-visible': { outline: '2px solid var(--app-palette-primary-main)', outlineOffset: 3 },
};

const iconBox = (size: number): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: size,
  height: size,
  borderRadius: '10px',
  color: 'primary.main',
  bgcolor: 'color-mix(in srgb, var(--app-palette-primary-main) 10%, transparent)',
  border: '1px solid color-mix(in srgb, var(--app-palette-primary-main) 20%, transparent)',
});

type Channel = {
  key: string;
  label: string;
  value: string;
  href: string;
  icon: SvgIconComponent;
};

// External profiles (rendered byte-for-byte from the real handles/URLs).
const CHANNELS: Channel[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    value: 'gadingadityaperdana',
    href: 'https://www.linkedin.com/in/gadingadityaperdana/',
    icon: LinkedInIcon,
  },
  {
    key: 'github',
    label: 'GitHub',
    value: 'cujoramirez',
    href: 'https://github.com/cujoramirez',
    icon: GitHubIcon,
  },
  {
    key: 'scholar',
    label: 'Google Scholar',
    value: 'Gading Aditya Perdana',
    href: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ',
    icon: SchoolIcon,
  },
];

const LOCATION = 'Central Jakarta';

// Split the email at the @ so it only ever wraps there (never mid-word) on a narrow card.
const EMAIL_AT = CONTACT.email.indexOf('@');
const EMAIL_LOCAL = EMAIL_AT === -1 ? CONTACT.email : CONTACT.email.slice(0, EMAIL_AT);
const EMAIL_DOMAIN = EMAIL_AT === -1 ? '' : CONTACT.email.slice(EMAIL_AT);

// Email — the primary channel: a full-width glass detection card that powers up with the
// section's one-shot scan; the whole card is the mailto link.
const EmailCard = memo(function EmailCard({ inView }: { inView: boolean }) {
  return (
    <MuiLink href={`mailto:${CONTACT.email}`} underline="none" aria-label={`Send an email to ${CONTACT.email}`} sx={linkResetSx}>
      <LiquidGlass intensity="subtle" interactive blur={12} radius={18} style={GLASS_TINT} sx={glassCardSx}>
        <DetectionFrame
          scan
          active={inView}
          tag="PRIMARY"
          sx={[frameSx, { px: { xs: 1.75, md: 2.5 }, py: { xs: 1.75, md: 2.25 } }]}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexWrap: 'wrap',
              gap: { xs: 1.5, md: 2.5 },
            }}
          >
            <Box aria-hidden sx={iconBox(52)}>
              <EmailIcon sx={{ fontSize: 26 }} />
            </Box>

            {/* Full width on mobile so the address has room to sit on one line */}
            <Box sx={{ minWidth: 0, width: { xs: '100%', sm: 'auto' }, flex: { sm: '1 1 12rem' } }}>
              <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.66rem', letterSpacing: '0.16em', display: 'block', mb: 0.5 }}>
                Email
              </Box>
              <Typography
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 'clamp(1.05rem, 0.5vw + 0.95rem, 1.2rem)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.25,
                  color: 'text.primary',
                  // Break only at the @ (the <wbr> below), never mid-word.
                  overflowWrap: 'break-word',
                }}
              >
                {EMAIL_LOCAL}
                <wbr />
                {EMAIL_DOMAIN}
              </Typography>
            </Box>

            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '0.8rem',
                letterSpacing: '0.03em',
                color: 'primary.main',
              }}
            >
              Email me
              <ArrowForwardIcon className="ext-arrow" sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </DetectionFrame>
      </LiquidGlass>
    </MuiLink>
  );
});

// One external profile as a glass detection card; the whole card is the link.
const ChannelCard = memo(function ChannelCard({ channel }: { channel: Channel }) {
  const Icon = channel.icon;
  return (
    <MuiLink
      href={channel.href}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      aria-label={`${channel.label}: ${channel.value}, opens in a new tab`}
      sx={linkResetSx}
    >
      <LiquidGlass intensity="subtle" interactive blur={12} radius={16} style={GLASS_TINT} sx={glassCardSx}>
        <DetectionFrame sx={[frameSx, { px: { xs: 1.75, md: 2 }, py: { xs: 1.75, md: 2 } }]}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
            <Box aria-hidden sx={iconBox(42)}>
              <Icon sx={{ fontSize: 21 }} />
            </Box>
            <OpenInNewIcon
              className="ext-icon"
              aria-hidden
              sx={{ fontSize: 15, color: 'color-mix(in srgb, var(--app-palette-text-primary) 45%, transparent)' }}
            />
          </Box>

          <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.64rem', letterSpacing: '0.14em', display: 'block', mb: 0.5 }}>
            {channel.label}
          </Box>
          <Typography
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.98rem',
              letterSpacing: '-0.005em',
              lineHeight: 1.3,
              color: 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            {channel.value}
          </Typography>
        </DetectionFrame>
      </LiquidGlass>
    </MuiLink>
  );
});

const OptimizedModernContactComponent = () => {
  const prefersReducedMotion = useReducedMotion();
  const { performanceTier } = useSystemProfile();
  const reduce = !!prefersReducedMotion || performanceTier === 'low';

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef as RefObject<HTMLDivElement>, { once: true, margin: '-15% 0px' });
  const year = new Date().getFullYear();

  // Per-element reveal; static under reduced motion / low-end devices. Header stays visible.
  const item = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <Box
      ref={rootRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // Fill the viewport so this closing section is at least as tall as the fold. The
        // navbar scroll-spy marks a section active by which one fills the most of the
        // viewport, and the liquid indicator interpolates between the top two; a section
        // shorter than the viewport leaves the previous one (Experience) ~40% visible at
        // max scroll, so the indicator never fully snaps here. Filling the viewport drops
        // Experience to 0 and lets the indicator settle — and removes the empty tail.
        minHeight: { xs: 'auto', md: 'calc(100dvh - var(--section-py))' },
      }}
    >
      {/* Section header */}
      <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
          Contact
        </Typography>
        <Typography variant="h2" component="h2" sx={{ color: 'text.primary', mb: 1.5 }}>
          Get in touch
        </Typography>
        <Typography
          sx={{
            color: 'color-mix(in srgb, var(--app-palette-text-primary) 76%, transparent)',
            fontSize: '1rem',
            lineHeight: 1.6,
            maxWidth: '56ch',
            textWrap: 'pretty',
          }}
        >
          Open to research collaborations, AI engineering roles, and software opportunities.
        </Typography>

        {/* Location (context, not a contact channel) */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 2 }}>
          <LocationOnIcon
            aria-hidden
            sx={{ fontSize: 16, color: 'color-mix(in srgb, var(--app-palette-text-primary) 55%, transparent)' }}
          />
          <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.72rem' }}>
            <Box component="span" sx={visuallyHidden}>
              Location:{' '}
            </Box>
            {LOCATION}
          </Box>
        </Box>
      </Box>

      {/* Primary channel */}
      <motion.div {...item(0.05)}>
        <EmailCard inView={inView} />
      </motion.div>

      {/* External channels */}
      <Box
        sx={{
          mt: { xs: 1.75, md: 2 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: { xs: 1.75, md: 2 },
        }}
      >
        {CHANNELS.map((channel, index) => (
          <motion.div key={channel.key} {...item(0.12 + index * 0.07)} style={{ height: '100%' }}>
            <ChannelCard channel={channel} />
          </motion.div>
        ))}
      </Box>

      {/* Footer — anchors the page's close and carries the viewport-fill height to the bottom */}
      <Box component={motion.div} {...item(0.12 + CHANNELS.length * 0.07 + 0.05)} sx={{ mt: 'auto', pt: { xs: 4, md: 6 } }}>
        <Box
          component="footer"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            pt: { xs: 2.5, md: 3 },
            borderTop: '1px solid color-mix(in srgb, var(--app-palette-divider) 60%, transparent)',
          }}
        >
          <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.72rem' }}>
            © {year} Gading Aditya Perdana
          </Box>
          <Box
            component="span"
            sx={{ ...MONO_LABEL, fontSize: '0.72rem', color: 'color-mix(in srgb, var(--app-palette-text-primary) 55%, transparent)' }}
          >
            AI Researcher &amp; Developer
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const OptimizedModernContact = memo(OptimizedModernContactComponent);
OptimizedModernContact.displayName = 'OptimizedModernContact';

export default OptimizedModernContact;
