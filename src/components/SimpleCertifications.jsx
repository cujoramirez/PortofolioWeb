import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const SimpleCertifications = () => {
  return (
    <Box
      component="section"
      id="certifications"
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        minHeight: '50vh'
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            mb: 4
          }}
        >
          🎓 CERTIFICATIONS SECTION
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            fontSize: '1.2rem'
          }}
        >
          This is a test to see if the certifications section renders properly.
          <br />
          If you can see this, the section placement is working!
        </Typography>
      </Container>
    </Box>
  );
};

export default SimpleCertifications;

