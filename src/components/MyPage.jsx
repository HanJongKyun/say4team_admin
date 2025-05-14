import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/UserContext';
import axiosInstance from '../configs/axios-config';
import { useNavigate } from 'react-router-dom';
import { handleAxiosError } from '../configs/HandleAxiosError';
import { API_BASE_URL, USER } from '../configs/host-config';
import OrderListComponent from './OrderListComponent';

const MyPage = () => {
  const [memberInfo, setMemberInfo] = useState([]);
  const { userRole, onLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // 회원 정보를 불러오기
    /*
    이름, 이메일, 도시, 상세주소 우편번호를 노출해야 합니다.
    위 5가지 정보를 객체로 포장해서 memberInfoList에 넣어주세요.
    */
    const fetchMemberInfo = async () => {
      try {
        const url = '/myInfo';
        const res = await axiosInstance.get(`${API_BASE_URL}${USER}` + url);

        setMemberInfo([res.data.result]);
      } catch (e) {
        handleAxiosError(e, onLogout, navigate);
      }
    };

    fetchMemberInfo();
  }, []);

  return (
    <Container>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='회원정보' style={{ textAlign: 'center' }} />
            <CardContent>
              <Table>
                <TableBody>
                  {memberInfo.map((info, index) => (
                    <TableRow key={index}>
                      <TableCell>{info.key}</TableCell>
                      <TableCell>{info.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MyPage;
