import React, { memo, useState, useCallback, useRef, useMemo, RefObject } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { CERTIFICATIONS } from '../constants';
import { useSystemProfile } from './useSystemProfile';
import ImageSkeleton from './ImageSkeleton';

interface Certification {
  title: string;
  issuer: string;
  image: string;
  link?: string | null;
}

// Filter Chip Component
const FilterChip = memo(({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const theme = useTheme();

  return (
    <Chip
      label={label}
      onClick={onClick}
      size="small"
      sx={{
        height: 32,
        fontSize: '0.8rem',
        fontWeight: isActive ? 600 : 500,
        background: isActive 
          ? alpha(theme.palette.primary.main, 0.12) 
          : 'transparent',
        color: isActive 
          ? theme.palette.primary.main 
          : theme.palette.text.secondary,
        border: `1px solid ${isActive 
          ? alpha(theme.palette.primary.main, 0.3) 
          : alpha(theme.palette.divider, 0.15)}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: alpha(theme.palette.primary.main, isActive ? 0.15 : 0.05),
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      }}
    />
  );
});

FilterChip.displayName = 'FilterChip';

// Certification Card Component
const CertificationCard = memo(({
  cert,
  index,
}: {
  cert: Certification;
  index: number;
}) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef as RefObject<Element>, { once: true, margin: '-30px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback(() => {
    if (cert.link) {
      window.open(cert.link, '_blank', 'noopener,noreferrer');
    }
  }, [cert.link]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.4,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.03, 0.3),
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Box
        onClick={handleClick}
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          cursor: cert.link ? 'pointer' : 'default',
          transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
          '&:hover': cert.link ? {
            transform: 'translateY(-6px)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}, 0 0 30px ${alpha(theme.palette.primary.main, 0.08)}`,
            borderColor: alpha(theme.palette.primary.main, 0.25),
            '& .cert-overlay': {
              opacity: 1,
            },
            '& .cert-image': {
              transform: 'scale(1.05)',
            },
          } : {},
        }}
      >
        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '4/3',
            overflow: 'hidden',
            background: alpha(theme.palette.text.primary, 0.03),
          }}
        >
          {!imageError && (
            <Box
              component="img"
              className="cert-image"
              src={cert.image}
              alt={cert.title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'all 0.3s ease',
              }}
            />
          )}

          {/* Loading state */}
          {!imageLoaded && !imageError && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
              }}
            >
              <ImageSkeleton aspectRatio="4/3" borderRadius={0} />
            </Box>
          )}

          {/* Error state */}
          {imageError && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
              }}
            >
              <VerifiedIcon sx={{ fontSize: 32, opacity: 0.3 }} />
            </Box>
          )}

          {/* Hover Overlay */}
          {cert.link && (
            <Box
              className="cert-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, transparent 40%, ${alpha(theme.palette.common.black, 0.7)} 100%)`,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 2,
                opacity: 0,
                transition: 'opacity 0.25s ease',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                <OpenInNewIcon sx={{ fontSize: 14 }} />
                View Certificate
              </Box>
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ p: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.85rem',
              color: theme.palette.text.primary,
              lineHeight: 1.3,
              mb: 0.75,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {cert.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VerifiedIcon 
              sx={{ 
                fontSize: 14, 
                color: theme.palette.primary.main,
                opacity: 0.8,
              }} 
            />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {cert.issuer}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
});

CertificationCard.displayName = 'CertificationCard';

// Main Component
const OptimizedCertificationsComponent = () => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const [selectedIssuer, setSelectedIssuer] = useState<string>('All');

  // Use constant directly - no need for useMemo since CERTIFICATIONS never changes
  const certifications = CERTIFICATIONS as Certification[];

  const issuers = useMemo(() => {
    const uniqueIssuers = [...new Set(certifications.map((cert) => cert.issuer))];
    return ['All', ...uniqueIssuers];
  }, [certifications]);

  const filteredCertifications = useMemo(() => {
    if (selectedIssuer === 'All') return certifications;
    return certifications.filter((cert) => cert.issuer === selectedIssuer);
  }, [certifications, selectedIssuer]);

  const handleFilterChange = useCallback((issuer: string) => {
    setSelectedIssuer(issuer);
  }, []);

  // Group by issuer for stats
  const stats = useMemo(() => {
    const groups: Record<string, number> = {};
    certifications.forEach((cert) => {
      groups[cert.issuer] = (groups[cert.issuer] || 0) + 1;
    });
    return groups;
  }, [certifications]);

  return (
    <Box
      component="section"
      id="certifications"
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
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 60%)`,
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
              Professional Development
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
              Certifications
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
              {certifications.length} certifications from {Object.keys(stats).length} platforms including Kaggle, FreeCodeCamp, and NVIDIA
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

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1,
              mb: { xs: 4, md: 6 },
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {issuers.map((issuer) => (
              <FilterChip
                key={issuer}
                label={issuer === 'All' ? `All (${certifications.length})` : `${issuer} (${stats[issuer] || 0})`}
                isActive={selectedIssuer === issuer}
                onClick={() => handleFilterChange(issuer)}
              />
            ))}
          </Box>
        </motion.div>

        {/* Certifications Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIssuer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              {filteredCertifications.map((cert, index) => (
                <CertificationCard
                  key={cert.title}
                  cert={cert}
                  index={index}
                />
              ))}
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: alpha(theme.palette.text.secondary, 0.7),
              fontSize: '0.8rem',
              mt: 4,
            }}
          >
            Showing {filteredCertifications.length} certification{filteredCertifications.length !== 1 ? 's' : ''}
            {selectedIssuer !== 'All' && ` from ${selectedIssuer}`}
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

const OptimizedCertifications = memo(OptimizedCertificationsComponent);
OptimizedCertifications.displayName = 'OptimizedCertifications';

export default OptimizedCertifications;
