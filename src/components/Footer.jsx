import { Container, Typography } from '@mui/material';
import React from 'react';

const Footer = () => {
  return (
    <Container style={{ padding: '20px 0', textAlign: 'center' }}>
      <Typography variant='body2' color='textSecondary'>
        © 2025 MyApp, All Rights Reserved.
      </Typography>
    </Container>
  );
};

export default Footer;