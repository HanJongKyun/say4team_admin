import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, PROD } from '../configs/host-config';
import AuthContext from '../context/UserContext';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn } = useContext(AuthContext);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인하세요');
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await axiosInstance.get(`${API_BASE_URL}${PROD}/${id}`);
      setProduct(res.data.result);
    };
    fetchDetail();
  }, [id]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300); // 스크롤 300px 이상일 때 표시
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`${API_BASE_URL}${PROD}/delete`, {
        params: { id: product.id },
      });
      if (res.status === 200 || res.status === 204) {
        alert('삭제 성공!');
        navigate('/product/manage');
      } else {
        alert('삭제 실패');
      }
    } catch (e) {
      console.error(e);
      alert('서버 오류로 삭제 실패');
    }

    handleClose();
  };

  if (!product) return <div>로딩 중...</div>;

  return (
    <Box sx={{ mt: 6, mb: 10 }}>
      <Card sx={{ p: 3, position: 'relative' }}>
        <Button
          variant='outlined'
          color='primary'
          sx={{ position: 'absolute', top: 16, right: 120 }} // ← 왼쪽으로 이동
          onClick={() => navigate(`/product/edit/${product.id}`)}
        >
          수정하기
        </Button>

        <Button
          variant='outlined'
          color='error'
          sx={{ position: 'absolute', top: 16, right: 16 }}
          onClick={handleOpen}
        >
          삭제하기
        </Button>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          <DialogContent>
            <p>이 작업은 되돌릴 수 없습니다.</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color='primary'>
              취소
            </Button>
            <Button onClick={handleDelete} color='error'>
              삭제
            </Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={4}>
          {/* 왼쪽 슬라이더: 썸네일 + 대표이미지 */}
          <Grid item xs={12} md={5}>
            <Swiper spaceBetween={10} slidesPerView={1}>
              {[product.thumbnailPath, product.mainImagePath].map(
                (url, idx) => (
                  <SwiperSlide key={idx}>
                    <Box
                      component='img'
                      src={url}
                      alt={`이미지 ${idx + 1}`}
                      sx={{
                        width: '100%',
                        maxHeight: 300,
                        objectFit: 'cover',
                        borderRadius: 2,
                        boxShadow: 2,
                      }}
                    />
                  </SwiperSlide>
                ),
              )}
            </Swiper>
          </Grid>

          {/* 오른쪽 정보 */}
          <Grid item xs={12} md={7} mt={4}>
            <CardContent>
              <Typography variant='h5' fontWeight='bold' gutterBottom>
                {product.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant='body2' sx={{ mb: 1 }}>
                <strong>카테고리:</strong> {product.categoryName}
              </Typography>
              <Typography variant='body2' sx={{ mb: 1 }}>
                <strong>가격:</strong> {product.price?.toLocaleString()}원
              </Typography>
              <Typography variant='body2' sx={{ mb: 1 }}>
                <strong>재고 수량:</strong> {product.stockQuantity}개
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  mb: 2,
                  whiteSpace: 'pre-line', // 🔥 핵심 설정
                }}
              >
                <strong>설명:</strong>
                <br />
                {product.description}
              </Typography>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

      {/* 상세 이미지 */}
      {product.productImages?.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 'bold',
              paddingBottom: 1,
              marginBottom: 3,
              textAlign: 'center',
            }}
          >
            상세 이미지
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // 중앙 정렬
              gap: 4, // 이미지 간 간격
              px: 2,
            }}
          >
            {product.productImages.map((imgUrl, index) => (
              <Box
                key={index}
                component='img'
                src={imgUrl}
                alt={`상세 이미지 ${index + 1}`}
                sx={{
                  maxWidth: '800px', // 너무 커지지 않게 제한
                  width: '100%', // 부모 크기에 맞춤
                  height: 'auto', // 비율 유지
                  borderRadius: 2,
                  boxShadow: 1,
                  objectFit: 'contain',
                }}
              />
            ))}
          </Box>
        </Box>
      )}
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
    </Box>
  );
};

export default ProductDetail;
