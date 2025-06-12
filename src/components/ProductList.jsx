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
  InputLabel,
  FormControl,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/UserContext';
import CartContext from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../configs/axios-config';
import { throttle } from 'lodash';
import { API_BASE_URL, PROD, CATEGORY } from '../configs/host-config';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ProductList = ({ pageTitle }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  if (!isLoggedIn) {
    alert('로그인하세요');
    navigate('/', { replace: true });
    return null;
  }

  // --- 상태 변수 정의 ---
  const [searchType, setSearchType] = useState('ALL'); // 'ALL' 또는 categoryId
  const [searchValue, setSearchValue] = useState(''); // 검색어 (항상 사용)

  const [productList, setProductList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [isLastPage, setLastPage] = useState(false); // 마지막 페이지 여부
  const [isLoading, setIsLoading] = useState(false); // 데이터 로딩 중 여부
  const pageSize = 15;

  const [showScrollTop, setShowScrollTop] = useState(false);

  const [categoriesForFilter, setCategoriesForFilter] = useState([]);
  const [loadingCategoriesForFilter, setLoadingCategoriesForFilter] =
    useState(true);
  const [errorCategoriesForFilter, setErrorCategoriesForFilter] =
    useState(null);

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'ADMIN';

  const [selected, setSelected] = useState({});

  const handleCheckboxChange = (productId, isChecked) => {
    setSelected((prevSelected) => ({
      ...prevSelected,
      [productId]: isChecked,
    }));
  };

  // --- 스크롤 상단 이동 버튼 관련 이펙트 ---
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

  // --- 카테고리 목록을 백엔드에 요청하는 함수 (검색 필터용) ---
  useEffect(() => {
    const fetchCategoriesForFilter = async () => {
      console.log('[ProductList] 카테고리 목록 요청 시작...');
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${CATEGORY}/list?sort=categoryId,ASC`,
        );
        console.log('[ProductList] 카테고리 목록 응답 데이터:', res.data);
        setCategoriesForFilter(res.data);
        setLoadingCategoriesForFilter(false);
        console.log('[ProductList] 카테고리 로딩 상태 -> false');
      } catch (e) {
        console.error('[ProductList] 카테고리 불러오기 실패:', e);
        setErrorCategoriesForFilter('카테고리 목록을 불러오는데 실패했습니다.');
        setLoadingCategoriesForFilter(false);
        console.log('[ProductList] 카테고리 로딩 상태 -> false (에러 발생)');
      }
    };
    fetchCategoriesForFilter();
  }, []);

  // --- 상품 목록을 백엔드에 요청하는 핵심 함수 ---
  // searchTypeParam과 searchValueParam을 직접 받도록 수정
  // isInitialOrSearch: true이면 기존 목록을 초기화하고 첫 페이지를 로드 (검색/초기 로드용)
  //                    false이면 기존 목록에 다음 페이지를 추가 (스크롤 페이징용)
  const loadProduct = async (
    searchTypeParam,
    searchValueParam,
    pageNum,
    isInitialOrSearch = false,
  ) => {
    // 이미 로딩 중이고, 초기/검색 로드가 아닐 때 (즉, 스크롤 페이징 중) 중단
    if (isLoading && !isInitialOrSearch) {
      console.log('[ProductList] 이미 로딩 중이므로 추가 요청 중단.');
      return;
    }
    // 마지막 페이지인데, 초기/검색 로드가 아닐 때 (즉, 스크롤 페이징 중) 중단
    if (isLastPage && !isInitialOrSearch) {
      console.log('[ProductList] 마지막 페이지이므로 추가 요청 중단.');
      return;
    }

    console.log('[ProductList] 상품 목록 로드 요청 시작!');

    const params = {
      size: pageSize,
      page: pageNum, // 전달받은 페이지 번호 사용
    };

    // searchTypeParam과 searchValueParam을 직접 사용
    if (searchTypeParam !== 'ALL') {
      params.searchType = searchTypeParam;
    }
    if (searchValueParam.trim() !== '') {
      params.searchName = searchValueParam.trim();
    }

    console.log('[ProductList] 백엔드로 보낼 최종 params: ', params);

    setIsLoading(true);
    console.log('[ProductList] 상품 로딩 상태 -> true');

    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${PROD}/list?sort=productId,DESC`,
        { params },
      );
      const data = res.data;
      console.log('[ProductList] 상품 목록 응답 데이터:', data);

      if (data.result.length === 0) {
        setLastPage(true);
        if (isInitialOrSearch) {
          setProductList([]);
          console.log(
            '[ProductList] 검색 결과 없음. 목록 비우고 마지막 페이지로 설정.',
          );
        } else {
          console.log(
            '[ProductList] 다음 페이지에 데이터 없음. 마지막 페이지로 설정.',
          );
        }
      } else {
        setProductList((prevList) => {
          const newItems = data.result.filter(
            (newItem) =>
              !prevList.some((existingItem) => existingItem.id === newItem.id),
          );
          return isInitialOrSearch ? newItems : [...prevList, ...newItems];
        });
        setLastPage(false);
        console.log('[ProductList] 상품 목록 업데이트 완료.');
      }
    } catch (e) {
      console.error('[ProductList] 상품 로드 중 에러 발생:', e);
      setErrorCategoriesForFilter('상품 목록을 불러오는데 실패했습니다.');
      setLastPage(true);
    } finally {
      setIsLoading(false);
      console.log('[ProductList] 상품 로딩 상태 -> false (요청 완료)');
    }
  };

  // --- 컴포넌트 마운트 시 첫 페이지 로드 ---
  // (searchType, searchValue는 초기값 'ALL', ''으로 로드)
  useEffect(() => {
    loadProduct(searchType, searchValue, 0, true); // 초기 로드
  }, []);

  // --- 스크롤 페이징 처리 함수 ---
  useEffect(() => {
    const throttledScroll = throttle(scrollPagination, 1000);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  const scrollPagination = () => {
    const isBottom =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.scrollHeight - 100;
    if (isBottom && !isLastPage && !isLoading) {
      setCurrentPage((prevPage) => prevPage + 1);
      console.log('[ProductList] 스크롤 페이징: 다음 페이지 요청 준비');
    }
  };

  // --- currentPage 변경 시 다음 페이지 로드 (스크롤 페이징 전용) ---
  useEffect(() => {
    if (currentPage > 0) {
      console.log(
        `[ProductList] currentPage 변경 감지: 페이지 ${currentPage} 로드`,
      );
      loadProduct(searchType, searchValue, currentPage, false); // 기존 목록에 추가
    }
  }, [currentPage]); // currentPage가 변경될 때만 실행

  const handleProductClick = (productId) => {
    navigate(`/product/detail/${productId}`);
  };

  // --- 검색 버튼 클릭 핸들러 ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('[ProductList] 검색 버튼 클릭!');
    console.log(
      `  클릭 시 searchType: ${searchType}, searchValue: ${searchValue}`,
    );

    setProductList([]); // 목록 초기화
    setCurrentPage(0); // 페이지 0으로 리셋
    setLastPage(false); // 마지막 페이지 상태 초기화
    setIsLoading(false); // 로딩 상태 초기화

    // 현재 searchType과 searchValue 상태 값을 직접 loadProduct에 전달
    loadProduct(searchType, searchValue, 0, true); // 검색 시 즉시 최신 값으로 로드
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
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems='center'>
              <Grid item>
                <TextField
                  select
                  label={
                    <React.Fragment>
                      카테고리 <span style={{ color: 'red' }}>*</span>
                    </React.Fragment>
                  }
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    // searchType 변경 시 searchValue는 유지
                  }}
                  size='small'
                  sx={{ minWidth: 140, height: 40, fontSize: 14 }}
                  disabled={loadingCategoriesForFilter}
                  error={!!errorCategoriesForFilter}
                  helperText={errorCategoriesForFilter}
                >
                  <MenuItem value='ALL'>전체</MenuItem>
                  {loadingCategoriesForFilter ? (
                    <MenuItem disabled>로딩 중...</MenuItem>
                  ) : errorCategoriesForFilter ? (
                    <MenuItem disabled>{errorCategoriesForFilter}</MenuItem>
                  ) : (
                    categoriesForFilter.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName}
                      </MenuItem>
                    ))
                  )}
                </TextField>
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
        {isAdmin && (
          <Grid item xs={12} md='auto'>
            <Button href='/product/create' variant='contained' color='success'>
              상품등록
            </Button>
          </Grid>
        )}
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
              {productList.length > 0 ? (
                productList.map((product) => (
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
                          inputProps={{ min: 0 }}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    {isLoading && currentPage === 0
                      ? '상품을 로딩 중입니다...'
                      : '등록된 상품이 없습니다.'}
                  </TableCell>
                </TableRow>
              )}
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
