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
import { replace, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { throttle } from 'lodash';
import { API_BASE_URL, PROD } from '../configs/host-config';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ProductList = ({ pageTitle }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  if (!isLoggedIn) {
    alert('로그인하세요');
    navigate('/', replace); // ← 이렇게 써야 함!
  }

  const [searchType, setSearchType] = useState('ALL');
  const [searchValue, setSearchValue] = useState('');
  const [productList, setProductList] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지를 나타내는 변수
  const [isLastPage, setLastPage] = useState(false); // 마지막 페이지 여부
  // 현재 로딩중이냐? -> 백엔드로부터 상품 목록 요청을 보내서 아직 데이터를 받아오는 중인가?
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 15;

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

    params.searchType = searchType;
    params.searchName = searchValue;

    console.log('백엔드로 보낼 params: ', params);

    setIsLoading(true); // 요청 보내기 바로 직전에 로딩 상태 true 만들기

    try {
      const res = await axios.get(
        `${API_BASE_URL}${PROD}/list?sort=productId,DESC`,
        {
          params,
        },
      );
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

  const handleProductClick = (productId) => {
    navigate(`/product/detail/${productId}`);
  };

  return (
    <Container sx={{ mt: 5, mb: 10 }}>
      <Grid
        container
        justifyContent='space-between'
        alignItems='center'
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Grid item xs={12} md={8}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setProductList([]);
              setCurrentPage(0);
              setIsLoading(false);
              setLastPage(false);
              loadProduct();
            }}
          >
            <Grid container spacing={2} alignItems='center'>
              <Grid item>
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  displayEmpty
                  size='small' // ← 이거 중요!
                  sx={{ minWidth: 140, height: 40, fontSize: 14 }} // ← 텍스트 크기 & 높이 정렬
                >
                  <MenuItem value='ALL'>전체</MenuItem>
                  {/* 카테고리 */}
                  <MenuItem value='1'>Doodle Persian</MenuItem>
                  <MenuItem value='2'>É</MenuItem>
                  <MenuItem value='3'>Textiles</MenuItem>
                  <MenuItem value='4'>Homedeco</MenuItem>
                  <MenuItem value='5'>Mirror</MenuItem>
                  <MenuItem value='6'>Lighting</MenuItem>
                  <MenuItem value='7'>Lifestyle</MenuItem>
                  <MenuItem value='8'>Goods</MenuItem>
                  <MenuItem value='9'>dummy</MenuItem>
                </Select>
              </Grid>
              <Grid item>
                <TextField
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  label='Search'
                  size='small'
                  sx={{ minWidth: 200 }}
                />
              </Grid>
              <Grid item>
                <Button type='submit' variant='contained'>
                  검색
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>

      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography
            variant='h6'
            align='center'
            sx={{ mb: 3, fontWeight: 'bold' }}
          >
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
                <TableRow
                  key={product.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <TableCell>
                    <img
                      src={product.thumbnailPath}
                      alt={product.name}
                      style={{
                        height: '100px',
                        width: 'auto',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price.toLocaleString()}원</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  {!isAdmin && (
                    <TableCell>
                      <TextField
                        type='number'
                        value={product.quantity || 0}
                        size='small'
                        onChange={(e) =>
                          setProductList((prevList) =>
                            prevList.map((p) =>
                              p.id === product.id
                                ? { ...p, quantity: parseInt(e.target.value) }
                                : p,
                            ),
                          )
                        }
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                  )}
                  {!isAdmin && (
                    <TableCell>
                      <Checkbox
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
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          variant='contained'
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            minWidth: 'auto',
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#000',
            color: '#fff',
            boxShadow: 3,
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </Button>
      )}
    </Container>
  );
};

export default ProductList;
