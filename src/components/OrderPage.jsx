import {
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useContext } from 'react';
import CartContext from '../context/CartContext';
import axios from 'axios';
import axiosInstance from '../configs/axios-config';
import { handleAxiosError } from '../configs/HandleAxiosError';
import { API_BASE_URL, ORDER } from '../configs/host-config';

const OrderPage = () => {
  const { productsInCart, clearCart: onClear } = useContext(CartContext);

  const clearCart = () => {
    onClear();
  };

  const orderCreate = async () => {
    // 백엔드가 달라는 형태로 줘야함
    const orderProducts = productsInCart.map((p) => ({
      productId: p.id,
      productQuantity: p.quantity,
    }));

    if (orderProducts.length < 0) {
      alert('주문할 물품이 없습니다!');
    }
    const yesOrNo = confirm(
      `${orderProducts.length}개의 상품을 주문하시겠습니까?`,
    );
    if (!yesOrNo) {
      alert('주문을 취소합니다.');
      return;
    }

    // const res = await fetch('http://localhost:8181/order/create', {
    //   method: 'POST',
    //   headers: {
    //     'Content-type': 'application/json',
    //     Authorization: 'Bearer' + localStorage.getItem('ACCESS_TOKEN'),
    //   },
    //   body: JSON.stringify(orderProducts),
    // });
    // const data = res.json(); -> fetch사용시 데이터 꺼내는 과정

    // axios 를 이용한 백엔드 요청
    // axios 는 요청방식에 따라 메서드를 제공함.
    // (url, 전달하고자 하는 데이터 (JSON으로 직접 변경 X), 헤더 정보)
    // axios는 정상이 아닌 200번대 의외는 다 예외로 처리함.
    // try,catch 로 작성합니다. (fetch는 400 번대 응답에도 예외 없음)
    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}${ORDER}/create`,
        orderProducts,
      );

      alert('주문이 완료!');
      clearCart();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <Container>
      <Grid container justifyContent='center' style={{ margin: '20px 0' }}>
        <Typography variant='h5'>장바구니 목록</Typography>
      </Grid>
      <Grid
        container
        justifyContent='space-between'
        style={{ marginBottom: '20px' }}
      >
        <Button onClick={clearCart} color='secondary' variant='contained'>
          장바구니 비우기
        </Button>
        <Button onClick={orderCreate} color='primary' variant='contained'>
          주문하기
        </Button>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제품ID</TableCell>
              <TableCell>제품명</TableCell>
              <TableCell>주문수량</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productsInCart.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrderPage;
