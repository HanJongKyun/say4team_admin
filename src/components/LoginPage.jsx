import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import axios from 'axios';
import { API_BASE_URL, USER } from '../configs/host-config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  //환경변수에서 가져오기
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  useEffect(() => {
    const handleMessage = (e) => {
      if (
        e.origin !== 'https://say4teamadmin.shop' &&
        e.origin !== window.location.origin
      )
        return;

      if (e.data.type === 'OAUTH_SUCCESS') {
        const { token, id, role, provider } = e.data;
        alert('카카오 로그인 성공');
        onLogin(e.data);
        navigate('/');
      }
    };

    //브라우저에 이벤트 바인딩 -> 백엔드에서 postMessage를 통해 부모 창으로 데이터 전송합니다.
    //부모창에 message를 수신하는 이벤트를 지정해서 해당 데이터를 읽어오겠다.
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin, navigate]);

  const doLogin = async () => {
    const loginData = {
      email,
      password,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/doLogin`, loginData);
      alert('로그인 성공!');
      onLogin(res.data.result);
      navigate('/');
    } catch (error) {
      console.log(error); // 백엔드 데이터 :  e.response.data
      alert('로그인 실패. 아이디나 비밀번호를 확인하세요.');
    }
  };
  //구글 로그인 처리
  const handleGoogleLogin = () => {
    console.log('구글 로그인 클릭!');
  };
  const handleKakaoLogin = () => {
    console.log('카카오 로그인 클릭!');
    //로그인 상태 구분하기위한 상태값 전달
    const adminLoginState = btoa(
      JSON.stringify({ clientType: 'admin', csrfToken: '...' }),
    );
    //로그인 팝업창 열기
    const popup = window.open(
      `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code&prompt=login&state=${adminLoginState}`,
      'kakao-login',
      'width=500,height=600,scrollbars=yes,resizable=yes',
    );
  };

  return (
    <Grid container justifyContent='center'>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardHeader title='로그인' style={{ textAlign: 'center' }} />
          <CardContent>
            {/* 소셜 로그인 섹션 */}
            <Box mb={3}>
              <Button
                variant='outlined'
                fullWidth
                onClick={handleKakaoLogin}
                sx={{
                  mb: 2,
                  borderColor: '#fee500',
                  color: '#3c1e1e',
                  backgroundColor: '#fee500',
                  '&:hover': {
                    borderColor: '#fdd835',
                    backgroundColor: '#fdd835',
                  },
                  textTransform: 'none',
                  fontSize: '16px',
                  height: '48px',
                }}
                startIcon={
                  <img
                    src='https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png'
                    alt='Kakao'
                    style={{ width: '20px', height: '20px' }}
                  />
                }
              >
                Kakao로 로그인
              </Button>

              <Box display='flex' alignItems='center' my={3}>
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant='body2'
                  sx={{ px: 2, color: 'text.secondary' }}
                >
                  또는
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
            </Box>

            {/** 기존 로그인 폼 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                doLogin();
              }}
            >
              <TextField
                label='Email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    type='submit'
                    color='primary'
                    variant='contained'
                    fullWidth
                  >
                    로그인
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* 비밀번호 변경 모달 */}
      {/* <Dialog open={resetPassword} onClose={() => setResetPassword(false)}>
          <ResetPasswordModal handleClose={() => setResetPassword(false)} />
        </Dialog> */}
    </Grid>
  );
};

export default LoginPage;
