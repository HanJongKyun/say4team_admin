import { Container, Typography } from '@mui/material';
import React, { useContext } from 'react';
import AuthContext from '../context/UserContext';

const Home = () => {
  const { isLoggedIn, userRole } = useContext(AuthContext);
  return (
    <Container>
      <Typography variant='h1' align='center' gutterBottom>
        Welcome to the Home Page
      </Typography>
      <Typography variant='body1' align='center'>
        This is the homepage of the application.
      </Typography>
    </Container>
  );
};

export default Home;
