import React, { useState, useCallback, useRef, memo, useMemo, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Chip,
  Card,
  CardContent,
  CardActionArea,
  alpha,
  useTheme,
  useMediaQuery,
  Grid
} from "@mui/material";
import { 
  EmojiEvents, 
  Verified, 
  School, 
  Psychology, 
  Science,
  LaunchOutlined 
} from "@mui/icons-material";
import { CERTIFICATIONS } from "../constants";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Lightweight CSS-only background decoration
const OptimizedBackground = memo(({ theme, shouldAnimate }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background: `
        radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 50%)
      `,
      '&::before': shouldAnimate ? {
        content: '""',
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '3px',
        height: '3px',
        borderRadius: '50%',
        background: theme.palette.primary.main,
        opacity: 0.4,
        animation: 'certFloat 10s ease-in-out infinite',
        '@keyframes certFloat': {
          '0%, 100%': { transform: 'translate(0, 0) scale(0.8)', opacity: 0.2 },
          '50%': { transform: 'translate(40px, -40px) scale(1.2)', opacity: 0.6 }
        }
      } : {}
    }}
  />
));

// Optimized Filter Button - memoized with minimal animations
const OptimizedFilterButton = memo(({ issuer, isActive, onClick, shouldAnimate }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={shouldAnimate ? { scale: 1.03 } : {}}
      whileTap={shouldAnimate ? { scale: 0.98 } : {}}
    >
      <Chip
        label={issuer}
        onClick={onClick}
        variant={isActive ? "filled" : "outlined"}
        sx={{
          borderColor: isActive ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3),
          backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          fontWeight: isActive ? 600 : 500,
          fontSize: '0.875rem',
          height: 36,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, isActive ? 0.2 : 0.05)
          }
        }}
      />
    </motion.div>
  );
});

// Simplified Certification Image with better performance
const OptimizedCertificationImage = memo(({ src, alt, onError }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef(null);
  const isInView = useInView(imageRef, { once: true, margin: "50px" });

  const handleError = useCallback(() => {
    setImageError(true);
    onError?.(alt);
  }, [alt, onError]);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <Box 
      ref={imageRef} 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '160px',
        backgroundColor: alpha('#1e293b', 0.8),
        overflow: 'hidden',
        borderRadius: 1
      }}
    >
      {isInView && !imageError && (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Loading placeholder */}
      {(!isInView || !imageLoaded) && !imageError && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha('#374151', 0.8)
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              border: '2px solid transparent',
              borderTop: '2px solid #8b5cf6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
        </Box>
      )}
      
      {/* Error fallback */}
      {imageError && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha('#374151', 0.8),
            color: '#d1d5db',
            fontSize: '0.875rem'
          }}
        >
          Certificate Image
        </Box>
      )}
    </Box>
  );
});

// Optimized Certification Card with minimal animations
const OptimizedCertificationCard = memo(({ cert, shouldAnimate }) => {
  const theme = useTheme();
  
  const handleClick = useCallback(() => {
    if (cert.link) {
      window.open(cert.link, '_blank', 'noopener,noreferrer');
    }
  }, [cert.link]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={shouldAnimate ? { y: -3, scale: 1.01 } : {}}
    >
      <Card
        elevation={2}
        sx={{
          height: '100%',
          background: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 2,
          cursor: cert.link ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': cert.link ? {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: theme.shadows[4],
            '& .cert-badge': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          } : {}
        }}
      >
        <CardActionArea onClick={handleClick} disabled={!cert.link}>
          <Box sx={{ position: 'relative' }}>
            <OptimizedCertificationImage 
              src={cert.image}
              alt={cert.title}
            />
            
            {/* View certificate badge */}
            {cert.link && (
              <Box
                className="cert-badge"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.9),
                  color: 'white',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  opacity: 0,
                  transform: 'translateY(8px)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <LaunchOutlined sx={{ fontSize: 14 }} />
                View Certificate
              </Box>
            )}
          </Box>
          
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: '0.95rem',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {cert.title}
            </Typography>

            <Box display="flex" alignItems="center" mb={1}>
              <Verified 
                sx={{ 
                  fontSize: 16, 
                  color: theme.palette.primary.main, 
                  mr: 0.5 
                }} 
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.8rem', fontWeight: 500 }}
              >
                {cert.issuer}
              </Typography>
            </Box>

            {cert.date && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {cert.date}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
});

const OptimizedCertifications = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { performanceTier } = useSystemProfile();
  
  const [selectedIssuer, setSelectedIssuer] = useState("All");
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.1 });
  
  const shouldAnimate = performanceTier !== "low" && !isMobile;
  
  // Memoized data to prevent recalculations
  const issuers = useMemo(() => 
    ["All", ...new Set(CERTIFICATIONS.map(cert => cert.issuer))], 
    []
  );
  
  const filteredCertifications = useMemo(() => 
    selectedIssuer === "All" 
      ? CERTIFICATIONS 
      : CERTIFICATIONS.filter(cert => cert.issuer === selectedIssuer),
    [selectedIssuer]
  );

  const handleIssuerChange = useCallback((issuer) => {
    setSelectedIssuer(issuer);
  }, []);

  return (
    <Box
      ref={containerRef}
      component="section"
      id="certifications"
      sx={{
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${alpha(theme.palette.primary.main, 0.01)} 50%,
          ${alpha(theme.palette.secondary.main, 0.01)} 100%)`,
        color: 'white'
      }}
    >
      {/* Optimized background */}
      <OptimizedBackground theme={theme} shouldAnimate={shouldAnimate} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        {isInView && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
              <Chip
                icon={<EmojiEvents />}
                label="Professional Certifications"
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
                  px: 2
                }}
              />
              
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: { xs: 1, md: 2 },
                  lineHeight: 1.2
                }}
              >
                Certifications
              </Typography>

              <Box
                sx={{
                  height: 4,
                  width: 120,
                  background: `linear-gradient(90deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main})`,
                  borderRadius: 2,
                  margin: '0 auto'
                }}
              />
            </Box>
          </motion.div>
        )}

        {/* Filter Buttons */}
        <Box mb={{ xs: 4, md: 6 }}>
          <Box 
            display="flex" 
            flexWrap="wrap" 
            justifyContent="center" 
            gap={1.5}
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            {issuers.map((issuer) => (
              <OptimizedFilterButton
                key={issuer}
                issuer={issuer}
                isActive={selectedIssuer === issuer}
                onClick={() => handleIssuerChange(issuer)}
                shouldAnimate={shouldAnimate}
              />
            ))}
          </Box>
        </Box>

        {/* Certificates Grid */}
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ justifyContent: 'center' }}
        >
          {filteredCertifications.map((cert, index) => (
            <Grid 
              item
              key={`${cert.title}-${index}`}
              xs={6} 
              sm={4} 
              md={3} 
              lg={2}
              xl={2}
              sx={{ display: 'flex' }}
            >
              <OptimizedCertificationCard 
                cert={cert} 
                shouldAnimate={shouldAnimate}
              />
            </Grid>
          ))}
        </Grid>

        {/* Results count */}
        {filteredCertifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 4, fontSize: '0.875rem' }}
            >
              Showing {filteredCertifications.length} certification{filteredCertifications.length !== 1 ? 's' : ''}
              {selectedIssuer !== "All" && ` from ${selectedIssuer}`}
            </Typography>
          </motion.div>
        )}
      </Container>
    </Box>
  );
});

OptimizedCertifications.displayName = 'OptimizedCertifications';

export default OptimizedCertifications;