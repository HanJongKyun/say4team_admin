import React, { useContext } from 'react';
import AuthContext from '../context/UserContext';
import { Container, Typography, Box, Divider } from '@mui/material';

const Home = () => {
  const { isLoggedIn, userRole } = useContext(AuthContext);
  return (
    <Container maxWidth='md'>
      <Box
        sx={{
          backgroundColor: '#ffffff', // 화이트 박스
          color: '#000000', // 텍스트 블랙
          borderRadius: 2,
          boxShadow: 2,
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          wordBreak: 'keep-all',
          lineHeight: 1.6,
        }}
      >
        <Typography
          variant='h3'
          fontWeight='bold'
          gutterBottom
          sx={{ wordBreak: 'keep-word' }}
        >
          saytouche 관리자 페이지
        </Typography>

        <Typography variant='h6' color='text.secondary' sx={{ mb: 4 }}>
          홈인테리어 쇼핑몰 <strong>saytouche</strong>에 오신 것을 진심으로
          환영합니다..
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant='body1' sx={{ fontSize: '1.15rem' }}>
          이 페이지는 saytouche의 상품, 주문, 사용자 정보를 관리하는 <br />
          관리자 전용 페이지입니다.
        </Typography>

        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mt: 2, fontSize: '0.95rem' }}
        >
          상단 메뉴에서 원하는 기능을 선택해 관리 업무를 시작해 주세요.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
