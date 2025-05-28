import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  TextField,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { replace, useNavigate } from 'react-router-dom';
import { API_BASE_URL, USER } from '../configs/host-config';
import AuthContext from '../context/UserContext';

//날짜관련 패키지 임포트
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import axios from 'axios';

dayjs.locale('ko');

const MemberCreate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  // 생년월일 입력
  const [birthDate, setBirthDate] = useState(dayjs());

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailSendLoading, setEmailSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // react router dom에서 제공하는 훅 useNavigate
  // 사용자가 특정 요소를 누르지 않아도 이벤트 등에서 페이지를 이동시킬 때 사용하는 훅
  // 리턴받은 함수를 통해 원하는 url을 문자열로 전달합니다.
  const navigate = useNavigate();

  const { isLoggedIn } = useContext(AuthContext);
  if (isLoggedIn) {
    alert('여기 왜왔죠??');
    navigate('/', replace);
  }

  const verifyEmailCode = async () => {
    if (!verificationCode) {
      alert('인증 코드를 입력해주세요.');
      return;
    }

    setVerifyLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/verify`, {
        email,
        code: verificationCode,
      });

      console.log('응답된 데이터: ', res.data);

      setIsEmailVerified(true);
      alert('이메일 인증이 완료되었습니다.');
    } catch (error) {
      console.error('인증 확인 오류', error);
      const msg = error.response.data.statusMessage;
      if (msg === '인증 코드가 만료 되었습니다.') {
        alert('인증시간 만료되었습니다. 인증번호를 다시 발급 해주세요.');
      } else if (msg.indexOf('인증번호를 잘못 입력하셨습니다.') !== -1) {
        alert(
          `인증 코드가 올바르지 않습니다! , 남은 횟수 : ${msg.split(', ').get(1)}`,
        );
      } else if (
        msg ===
        '잘못된 요청 횟수가 과다하여 임시 차단 중입니다. 잠시 후에 시도해주세요.'
      ) {
        alert(
          '잘못된 요청 횟수가 과다하여 임시 차단 중입니다. 잠시 후에 시도해주세요.',
        );
      } else {
        alert('관리자에게 문의하세요!');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const memberCreate = async (e) => {
    console.log('클릭이벤트 발생');

    e.preventDefault();
    if (password.length < 8) {
      alert('비밀번호 8자리 이상으로 작성해주세요!');
      return;
    }

    // 백엔드에게 전송할 데이터 형태를 만들자 (DTO 형태대로)
    const registData = {
      name,
      email,
      password,
      address,
      birthDate,
      phone,
    };

    console.log('데이터 생성 완료');
    const res = await fetch(`${API_BASE_URL}${USER}/create?role=admin`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(registData),
    });
    console.log('받아온 데이터', res);
    const data = await res.json();
    if (data.statusCode === 201) {
      alert(`${data.result}님 환영합니다!`);
      navigate('/');
    } else {
      alert(data.statusMessage);
    }
  };

  const sendVerificationEmail = async () => {
    console.log('이메일 인증 버튼이 클릭됨!');
    if (!email) {
      alert('이메일을 먼저 입력해주세요!');
      return;
    }
    const regEmail =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    //정규 표현식 작성 후 변수에 대입해주면, 정규 표현식을 담은 객체로 저장이 됩니다.
    //해당 정규표현식 객체는 test 메서드를 통해, 전달된 값이 정규표현식에 일치하는 값인지를 검증하는 로직을 제공.
    if (!regEmail.test(email)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }
    setEmailSendLoading(true); //이메일 전송직전 로딩상태
    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/email-valid`, {
        // email: email, 로 써야 정석이지만 키밸류가 같을시 아래와 같이 기입가능
        email,
      });

      console.log('응답된 결과: ', res.data);

      setIsEmailSent(true); // 이메일 송신여부 설정
      alert('인증 코드가 이메일로 발송되었습니다.');
    } catch (error) {
      console.error('이메일 발송 오류 : ', error);
      if (
        error.response.data.statusMessage ===
        '잘못된 요청 횟수가 과다하여 임시 차단 중입니다. 잠시 후에 시도해주세요.'
      ) {
        alert(
          '잘못된 요청 횟수가 과다하여 임시 차단 중입니다. 잠시 후에 시도해주세요.',
        );
      }
      alert('인증 이메일 발송 중 오류 발생!');
    } finally {
      setEmailSendLoading(false); // 전송 되든 에러가 나든 로딩이 끝났음을 알려주자.
    }
  };

  return (
    <Grid container justifyContent='center'>
      <Grid item xs={12} sm={8} md={6}>
        <Card>
          <CardHeader title='회원가입' style={{ textAlign: 'center' }} />
          <CardContent>
            <form onSubmit={memberCreate}>
              {/* 이메일 필드와 인증 버튼 */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  label='Email'
                  type='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // 이메일이 변경되면 인증상태 초기화
                    if (isEmailSent || isEmailVerified) {
                      setIsEmailSent(false);
                      setIsEmailVerified(false);
                    }
                  }}
                  fullWidth
                  margin='normal'
                  required
                  // sx={{
                  //   '& .MuiInputBase-root': {
                  //     backgroundColor: isEmailVerified ? '#f5f5f5' : 'inherit',
                  //   },
                  // }}
                />
                <Button
                  variant='outlined'
                  onClick={sendVerificationEmail}
                  sx={{ mb: 1, minWidth: '100px' }}
                >
                  {emailSendLoading
                    ? '발송중...'
                    : isEmailVerified
                      ? '인증완료'
                      : '인증'}
                </Button>
              </Box>
              {/* 인증 코드 입력 필드 */}
              {isEmailSent && !isEmailVerified && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    label='인증 코드'
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    fullWidth
                    margin='normal'
                    placeholder='이메일로 받은 인증 코드를 입력하세요'
                  />
                  <Button
                    variant='outlined'
                    onClick={verifyEmailCode}
                    disabled={!verificationCode || verifyLoading}
                    sx={{ mb: 1, minWidth: '100px' }}
                  >
                    {verifyLoading ? '확인중...' : '확인'}
                  </Button>
                </Box>
              )}
              <TextField
                label='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <Grid container spacing={2} alignItems='center'>
                {/* 이름 필드 */}
                <Grid item xs={6}>
                  <TextField
                    label='이름'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    margin='none'
                    required
                  />
                </Grid>

                {/* 생년월일 필드 */}
                <Grid item xs={6}>
                  <TextField
                    label='생년월일'
                    type='date'
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                    }}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }} // ← 이거 안 쓰면 라벨 겹침
                  />
                </Grid>
              </Grid>

              <TextField
                label='주소'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
                margin='normal'
              />
              <PhoneInput
                country={'kr'} // 국가 코드
                value={phone}
                onChange={setPhone}
                inputStyle={{ width: '100%' }}
                enableAreaCodes={true}
              />
              <CardActions>
                <Button
                  type='submit'
                  color='primary'
                  variant='contained'
                  fullWidth
                  disabled={!isEmailVerified}
                >
                  회원가입
                </Button>
              </CardActions>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MemberCreate;
