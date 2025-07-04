import {
  AppBar,
  Button,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { API_BASE_URL, ORDER, SSE } from '../configs/host-config';

const Header = () => {
  // 로그인 상태에 따라 메뉴를 다르게 제공하고 싶다 -> Context에서 뽑아오면 되겠구나!
  const { isLoggedIn, onLogout, userRole } = useContext(AuthContext);
  const navigate = useNavigate();

  // useEffect(() => {
  //   console.log('role: ', userRole);
  //   const token = sessionStorage.getItem('ACCESS_TOKEN');

  //   if (userRole === 'ADMIN') {
  //     // 알림을 받기 위해 서버와 연결을 하기 위한 요청을 하겠다.
  //     // 기존에 사용하던 fetch, axios는 지속적 연결을 지원하지 않는다.
  //     const sse = new EventSourcePolyfill(`${API_BASE_URL}${SSE}/subscribe`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     sse.addEventListener('connect', (event) => {
  //       console.log(event);
  //     });

  //     // 30초마다 발생하는 알림. (연결을 유지하기 위해)
  //     sse.addEventListener('heartbeat', () => {
  //       console.log('Received heartbeat');
  //     });
  //   }
  // }, [userRole]);

  const handleLogout = () => {
    onLogout();
    alert('로그아웃 완료!');
    navigate('/login');
  };

  return (
    <AppBar
      position='static'
      color='transparent'
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <Toolbar>
        <Container>
          <Grid container alignItems='center'>
            {/* 왼쪽 메뉴 (관리자용) */}
            <Grid
              item
              xs={4}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              {/* {isLoggedIn && ( */}
              {isLoggedIn && (
                <>
                  <Button color='inherit' component={Link} to='/member/manage'>
                    회원관리
                  </Button>
                  <Button color='inherit' component={Link} to='/order/manage'>
                    주문관리
                  </Button>
                  <Button color='inherit' component={Link} to='/product/manage'>
                    상품관리
                  </Button>
                  <Button
                    color='inherit'
                    component={Link}
                    to='/category/manage'
                  >
                    카테고리 관리
                  </Button>
                </>
              )}
            </Grid>

            {/* 가운데 메뉴 */}
            <Grid item xs={4} style={{ textAlign: 'center' }}>
              <Button color='inherit' component={Link} to='/'>
                <Typography variant='h6'>saytouche Admin</Typography>
              </Button>
            </Grid>

            {/* 오른쪽 메뉴 (사용자용) */}
            <Grid
              item
              xs={4}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              {isLoggedIn && (
                <>
                  <Button color='inherit' onClick={handleLogout}>
                    로그아웃
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Button color='inherit' component={Link} to='/member/create'>
                    회원가입
                  </Button>
                  <Button color='inherit' component={Link} to='/login'>
                    로그인
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
