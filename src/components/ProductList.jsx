import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/UserContext';
import CartContext from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { throttle } from 'lodash';
import { API_BASE_URL, PROD } from '../configs/host-config';

const ProductList = ({ pageTitle }) => {
  const [searchType, setSearchType] = useState('optional');
  const [searchValue, setSearchValue] = useState('');
  const [productList, setProductList] = useState([]);
  const [selected, setSelected] = useState({});
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지를 나타내는 변수
  const [isLastPage, setLastPage] = useState(false); // 마지막 페이지 여부
  // 현재 로딩중이냐? -> 백엔드로부터 상품 목록 요청을 보내서 아직 데이터를 받아오는 중인가?
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 15;

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'ADMIN';

  const { addCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadProduct(); // 처음 화면에 진입하면 1페이지 내용을 불러오자. (매개값은 필요 없음)
    // 쓰로틀링: 짧은 시간동안 연속해서 발생한 이벤트들을 일정 시간으로 그룹화 하여
    // 순차적으로 적용할 수 있게 하는 기법 -> 스크롤 페이징
    // 디바운싱: 짧은 시간동안 연속해서 발생한 이벤트를 호출하지 않다가 마지막 이벤트로부터
    // 일정 시간 이후에 한번만 호출하게 하는 기능. -> 입력값 검증
    const throttledScroll = throttle(scrollPagination, 1000);
    window.addEventListener('scroll', throttledScroll);

    // 클린업 함수: 다른 컴포넌트가 렌더링 될 때 이벤트 해제
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  useEffect(() => {
    // useEffect는 하나의 컴포넌트에서 여러 개 선언이 가능.
    // 스크롤 이벤트에서 다음 페이지 번호를 준비했고,
    // 상태가 바뀌면 그 때 백엔드로 요청을 보낼 수 있게 로직을 나누었습니다.
    if (currentPage > 0) loadProduct();
  }, [currentPage]);

  // 상품 목록을 백엔드에 요청하는 함수
  const loadProduct = async () => {
    // 아직 로딩 중이라면 or 이미 마지막 페이지라면 더이상 진행하지 말어라.
    if (isLoading || isLastPage) return;

    console.log('아직 보여줄 컨텐트 더 있음!');

    const params = {
      size: pageSize,
      page: currentPage,
    };

    // 만약 사용자가 조건을 선택했고, 검색어를 입력했다면 프로퍼티를 추가하자.
    if (searchType !== 'optional' && searchValue) {
      params.category = searchType;
      params.searchName = searchValue;
    }

    console.log('백엔드로 보낼 params: ', params);

    setIsLoading(true); // 요청 보내기 바로 직전에 로딩 상태 true 만들기

    try {
      const res = await axios.get(`${API_BASE_URL}${PROD}/list`, {
        params,
      });
      const data = await res.data;
      console.log('result.length: ', data.result.length);

      if (data.result.length === 0) {
        setLastPage(true);
      } else {
        // 백엔드로부터 전달받은 상품 목록을 상태 변수에 세팅.
        setProductList((prevList) => [...prevList, ...data.result]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      // 요청에 대한 응답 처리가 끝나고 난 후 로딩 상태를 다시 false로
      setIsLoading(false);
    }
  };

  const scrollPagination = () => {
    // 브라우저 창의 높이 + 현재 페이지에서 스크롤 된 픽셀 값
    //>= (스크롤이 필요 없는)페이지 전체 높이에서 100px 이내에 도달했는가?
    const isBottom =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.scrollHeight - 100;
    if (isBottom && !isLastPage && !isLoading) {
      // 스크롤이 특정 구간에 도달하면 바로 요청 보내는 게 아니라 다음 페이지 번호를 준비하겠다.
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // 장바구니 클릭 이벤트 핸들러
  const handleAddToCart = () => {
    // 특정 객체에서 key값만 뽑아서 문자열 배열로 리턴해 주는 메서드
    const selectedProduct = Object.keys(selected);

    // key값만 뽑아서 selected에 들어있는 상품 중에 false 다 빼고 true인 것만 담겠다.
    const filtered = selectedProduct.filter((key) => selected[key]);

    // 사용자가 선택한 수량까지 파악해서 장바구니에 넣어 줍시다.
    const finalSelected = filtered.map((key) => {
      const product = productList.find((p) => p.id === parseInt(key));
      return {
        id: product.id,
        name: product.name,
        quantity: product.quantity,
      };
    });
    console.log(finalSelected);

    if (finalSelected.length < 1) {
      alert('장바구니에 추가할 상품을 선택해 주세요!');
      return;
    }

    for (let p of finalSelected) {
      if (!p.quantity) {
        alert('수량이 0개인 상품은 담을 수 없습니다.');
        return;
      }
    }

    if (confirm('상품을 장바구니에 추가하시겠습니까?')) {
      // 카트로 상품을 보내주자. (addCart에는 상품을 하나씩 보내세요.)
      finalSelected.forEach((product) => addCart(product));
      alert('선택한 상품이 장바구니에 추가되었습니다.');
    }

    if (confirm('장바구니 화면으로 이동할까요?')) {
      navigate('/order/cart');
    }
  };

  // 체크박스 클릭 이벤트 핸들러
  const handleCheckboxChange = (productId, checked) => {
    // 사용자가 특정 상품을 선택했는지에 대한 상태를 관리
    setSelected((prev) => ({
      ...prev,
      [productId]: checked,
    }));
  };

  return (
    <Container>
      <Grid
        container
        justifyContent='space-between'
        spacing={2}
        className='mt-5'
      >
        <Grid item>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // 검색 렌더링 진행 시 기존 목록을 지우고 다시 렌더링 해야 해요!
              setProductList([]);
              setCurrentPage(0);
              setIsLoading(false);
              setLastPage(false);
              loadProduct();
            }}
          >
            <Grid container spacing={2}>
              <Grid item>
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value='optional'>선택</MenuItem>
                  <MenuItem value='name'>상품명</MenuItem>
                  <MenuItem value='category'>카테고리</MenuItem>
                </Select>
              </Grid>
              <Grid item>
                <TextField
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  label='Search'
                />
              </Grid>
              <Grid item>
                <Button type='submit'>검색</Button>
              </Grid>
            </Grid>
          </form>
        </Grid>

        {!isAdmin && (
          <Grid item>
            <Button onClick={handleAddToCart} color='secondary'>
              장바구니에 담기
            </Button>
          </Grid>
        )}

        {isAdmin && (
          <Grid item>
            <Button href='/product/create' color='success'>
              상품등록
            </Button>
          </Grid>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' align='center'>
            {pageTitle}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>제품사진</TableCell>
                <TableCell>제품명</TableCell>
                <TableCell>가격</TableCell>
                <TableCell>재고수량</TableCell>
                {!isAdmin && <TableCell>주문수량</TableCell>}
                {!isAdmin && <TableCell>주문선택</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {productList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      style={{ height: '100px', width: 'auto' }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  {!isAdmin && (
                    <TableCell>
                      <TextField
                        type='number'
                        value={product.quantity || 0}
                        // 수량이 변경될 때마다 productList에서 지금 수량이 변경된 그 상품을 찾아서
                        // quantity라는 새로운 프로퍼티에 값을 세팅하겠다.
                        onChange={(e) =>
                          setProductList((prevList) =>
                            prevList.map((p) =>
                              p.id === product.id
                                ? { ...p, quantity: parseInt(e.target.value) }
                                : p,
                            ),
                          )
                        }
                        style={{ width: '70px' }}
                      />
                    </TableCell>
                  )}
                  {!isAdmin && (
                    <TableCell>
                      <Checkbox
                        // 특정 변수, 객체, 배열 등등을 논리값으로 변환하고 싶을때
                        // 앞에 !! 붙이면 논리값으로 변환됩니다.
                        checked={!!selected[product.id]}
                        onChange={(e) =>
                          handleCheckboxChange(product.id, e.target.checked)
                        }
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductList;
