import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, PROD, CATEGORY } from '../configs/host-config';
import { handleAxiosError } from '../configs/HandleAxiosError';
import AuthContext from '../context/UserContext';
import UploadIcon from '@mui/icons-material/Upload';

const ProductCreate = () => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('선택');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  // Validation error states
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [categoryIdError, setCategoryIdError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [stockQuantityError, setStockQuantityError] = useState(false);
  const [thumbnailImageError, setThumbnailImageError] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [productImagesError, setProductImagesError] = useState(false);

  const navigate = useNavigate();
  const { onLogout } = useContext(AuthContext);

  // 카테고리 목록을 불러오는 useEffect
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${CATEGORY}/list?sort=categoryId,DESC`,
        );
        setCategories(res.data);
        setLoadingCategories(false);
      } catch (e) {
        console.error('카테고리 불러오기 실패:', e);
        setErrorCategories('카테고리 목록을 불러오는데 실패했습니다.');
        setLoadingCategories(false);
        handleAxiosError(e, onLogout, navigate);
      }
    };
    fetchCategories();
  }, [onLogout, navigate]);

  // useRef를 사용하여 특정 요소를 참조하기
  const $fileTag = useRef();
  const $mainRef = useRef();
  const $detailRef = useRef();

  // 입력 유효성 검사 함수
  const validateForm = () => {
    let isValid = true;

    // 상품명 유효성 검사
    if (!name.trim()) {
      setNameError(true);
      isValid = false;
    } else {
      setNameError(false);
    }

    // 제품 설명 유효성 검사
    if (!description.trim()) {
      setDescriptionError(true);
      isValid = false;
    } else {
      setDescriptionError(false);
    }

    // 카테고리 유효성 검사
    if (categoryId === '선택') {
      setCategoryIdError(true);
      isValid = false;
    } else {
      setCategoryIdError(false);
    }

    // 가격 유효성 검사
    if (!price || parseFloat(price) <= 0) {
      setPriceError(true);
      isValid = false;
    } else {
      setPriceError(false);
    }

    // 재고수량 유효성 검사
    if (!stockQuantity || parseInt(stockQuantity) <= 0) {
      setStockQuantityError(true);
      isValid = false;
    } else {
      setStockQuantityError(false);
    }

    // 썸네일 이미지 유효성 검사
    if (!thumbnailImage) {
      setThumbnailImageError(true);
      isValid = false;
    } else {
      setThumbnailImageError(false);
    }

    // 대표 이미지 유효성 검사
    if (!mainImage) {
      setMainImageError(true);
      isValid = false;
    } else {
      setMainImageError(false);
    }

    // 상세 이미지 유효성 검사
    if (productImages.length === 0) {
      setProductImagesError(true);
      isValid = false;
    } else {
      setProductImagesError(false);
    }

    return isValid;
  };

  const productCreate = async (e) => {
    e.preventDefault();

    // 유효성 검사 수행
    if (!validateForm()) {
      alert('모든 필수 항목을 입력하거나 올바르게 선택해주세요.');
      return;
    }

    try {
      const registData = new FormData();
      registData.append('name', name);
      registData.append('description', description);
      registData.append('categoryId', categoryId);
      registData.append('price', price);
      registData.append('stockQuantity', stockQuantity);
      productImages.forEach((file) => {
        registData.append('images', file);
      });
      registData.append('thumbnailImage', thumbnailImage);
      registData.append('mainImage', mainImage);

      await axiosInstance.post(`${API_BASE_URL}${PROD}/create`, registData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(registData);
      alert('상품 등록이 성공적으로 완료되었습니다!');
      navigate('/product/manage');
    } catch (e) {
      console.error('상품 등록 실패:', e);
      handleAxiosError(e, onLogout, navigate);
      alert('상품 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const fileUpdate = () => {
    const file = $fileTag.current.files[0];
    setThumbnailImage(file);
    if (file) setThumbnailImageError(false);
  };

  const handleDetailImageUpload = () => {
    const newImages = Array.from($detailRef.current.files);
    setProductImages((prev) => {
      const updatedImages = [...prev, ...newImages];
      if (updatedImages.length > 0) {
        setProductImagesError(false);
      }
      return updatedImages;
    });
  };

  const handleMainImageUpload = () => {
    const mainImage = $mainRef.current.files[0];
    setMainImage(mainImage);
    if (mainImage) setMainImageError(false);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='상품등록' style={{ textAlign: 'center' }} />
            <CardContent>
              <Typography
                variant='body2'
                color='textSecondary'
                sx={{ mb: 2, textAlign: 'center' }}
              >
                <span style={{ color: 'red', fontWeight: 'bold' }}>*</span> 는
                필수 항목입니다.
              </Typography>
              <form onSubmit={productCreate}>
                <TextField
                  // required prop 제거하고 label에 직접 빨간색 *만 추가
                  label={
                    <React.Fragment>
                      상품명 <span style={{ color: 'red' }}>*</span>
                    </React.Fragment>
                  }
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(false);
                  }}
                  fullWidth
                  margin='normal'
                  // required prop 제거
                  error={nameError}
                  helperText={nameError && '상품명은 필수 항목입니다.'}
                />
                <TextField
                  label={
                    <React.Fragment>
                      제품 설명 <span style={{ color: 'red' }}>*</span>
                    </React.Fragment>
                  }
                  multiline
                  rows={6}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setDescriptionError(false);
                  }}
                  fullWidth
                  variant='outlined'
                  placeholder='제품에 대한 자세한 내용을 입력해 주세요.'
                  // required prop 제거
                  error={descriptionError}
                  helperText={
                    descriptionError && '제품 설명은 필수 항목입니다.'
                  }
                />
                <TextField
                  select
                  label={
                    <React.Fragment>
                      카테고리 <span style={{ color: 'red' }}>*</span>
                    </React.Fragment>
                  }
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setCategoryIdError(false);
                  }}
                  fullWidth
                  margin='normal'
                  // required prop 제거
                  disabled={loadingCategories}
                  error={categoryIdError || !!errorCategories}
                  helperText={
                    (categoryIdError && '카테고리를 선택해주세요.') ||
                    errorCategories
                  }
                >
                  <MenuItem value='선택'>카테고리 선택</MenuItem>
                  {loadingCategories ? (
                    <MenuItem disabled>로딩 중...</MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName}
                      </MenuItem>
                    ))
                  )}
                </TextField>
                <TextField
                  label={
                    <React.Fragment>
                      가격 <span style={{ color: 'red' }}>*</span>
                    </React.Fragment>
                  }
                  type='number'
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setPriceError(false);
                  }}
                  fullWidth
                  margin='normal'
                  // required prop 제거
                  error={priceError}
                  helperText={
                    priceError && '가격을 0보다 큰 숫자로 입력해주세요.'
                  }
                />
                <TextField
                  label={
                    <React.Fragment>
                      재고수량 <span style={{ color: 'red' }}>*</span>
                    </React.Fragment>
                  }
                  type='number'
                  value={stockQuantity}
                  onChange={(e) => {
                    setStockQuantity(e.target.value);
                    setStockQuantityError(false);
                  }}
                  fullWidth
                  margin='normal'
                  // required prop 제거
                  error={stockQuantityError}
                  helperText={
                    stockQuantityError &&
                    '재고수량을 0보다 큰 숫자로 입력해주세요.'
                  }
                />

                <Box sx={{ my: 3 }}>
                  <Typography
                    variant='subtitle1'
                    color={thumbnailImageError ? 'error' : 'textPrimary'}
                  >
                    썸네일 이미지 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Button
                    variant='outlined'
                    startIcon={<UploadIcon />}
                    onClick={() => $fileTag.current.click()}
                    sx={{
                      color: '#000000',
                      borderColor: '#000000',
                      '&:hover': {
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: '#000000',
                      },
                    }}
                  >
                    업로드
                  </Button>
                  <input
                    type='file'
                    accept='image/*'
                    ref={$fileTag}
                    onChange={fileUpdate}
                    style={{ display: 'none' }}
                  />
                  {thumbnailImage && (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      선택된 파일: {thumbnailImage.name}
                    </Typography>
                  )}
                  {thumbnailImageError && (
                    <Typography variant='caption' color='error' sx={{ ml: 1 }}>
                      썸네일 이미지는 필수입니다.
                    </Typography>
                  )}
                </Box>
                <Box sx={{ my: 3 }}>
                  <Typography
                    variant='subtitle1'
                    color={mainImageError ? 'error' : 'textPrimary'}
                  >
                    대표 이미지 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Button
                    variant='outlined'
                    startIcon={<UploadIcon />}
                    onClick={() => $mainRef.current.click()}
                    sx={{
                      color: '#000000',
                      borderColor: '#000000',
                      '&:hover': {
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: '#000000',
                      },
                    }}
                  >
                    업로드
                  </Button>
                  <input
                    type='file'
                    accept='image/*'
                    ref={$mainRef}
                    onChange={handleMainImageUpload}
                    style={{ display: 'none' }}
                  />
                  {mainImage && (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      선택된 파일: {mainImage.name}
                    </Typography>
                  )}
                  {mainImageError && (
                    <Typography variant='caption' color='error' sx={{ ml: 1 }}>
                      대표 이미지는 필수입니다.
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='subtitle1'
                    color={productImagesError ? 'error' : 'textPrimary'}
                  >
                    상세 이미지 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Button
                    variant='outlined'
                    startIcon={<UploadIcon />}
                    onClick={() => $detailRef.current.click()}
                    sx={{
                      color: '#000000',
                      borderColor: '#000000',
                      '&:hover': {
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderColor: '#000000',
                      },
                    }}
                  >
                    업로드
                  </Button>
                  <input
                    type='file'
                    accept='image/*'
                    ref={$detailRef}
                    onChange={handleDetailImageUpload}
                    multiple
                    style={{ display: 'none' }}
                  />
                  {productImages.length > 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        maxHeight: 140,
                        overflowY: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      {productImages.map((file, index) => (
                        <Box
                          key={file.name + index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid #eee',
                            py: 1,
                          }}
                        >
                          <Typography variant='body2'>{file.name}</Typography>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            onClick={() =>
                              setProductImages((prev) =>
                                prev.filter((f) => f.name !== file.name),
                              )
                            }
                          >
                            삭제
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {productImagesError && (
                    <Typography variant='caption' color='error' sx={{ ml: 1 }}>
                      상세 이미지는 최소 1개 이상 필요합니다.
                    </Typography>
                  )}
                </Box>
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  sx={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#333333',
                    },
                  }}
                >
                  등록
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductCreate;
