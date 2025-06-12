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
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, PROD, CATEGORY } from '../configs/host-config';
import { handleAxiosError } from '../configs/HandleAxiosError';
import AuthContext from '../context/UserContext';
import UploadIcon from '@mui/icons-material/Upload';

const ProductUpdate = () => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('선택');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [description, setDescription] = useState('');
  const [product, setProduct] = useState(null);

  // 카테고리 목록을 위한 상태 추가
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
  const [productImagesError, setProductImagesError] = useState(false); // 상세 이미지 오류 상태 추가

  const { id } = useParams();
  const navigate = useNavigate();
  const { onLogout } = useContext(AuthContext);

  // useRef를 사용하여 특정 요소를 참조하기
  const $fileTag = useRef();
  const $mainRef = useRef();
  const $detailRef = useRef();

  // 상품 상세 정보 불러오기
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${PROD}/detail/${id}`,
        );
        setProduct(res.data.result);
      } catch (e) {
        console.error('상품 상세 정보 불러오기 실패:', e);
        handleAxiosError(e, onLogout, navigate);
      }
    };
    fetchProductDetail();
  }, [id, onLogout, navigate]);

  // 카테고리 목록 불러오기
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

  // product 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setStockQuantity(product.stockQuantity);
      setCategoryId(product.categoryId); // 기존 카테고리 ID 설정
      // 이미지 업데이트 시, 기존 이미지가 있다면 해당 이미지 정보도 초기화해야 할 수 있습니다.
      // 여기서는 파일 객체가 아닌 URL이므로, 기존 파일 객체를 set하는 대신,
      // 새로 업로드하는 경우에만 상태를 변경하도록 로직을 유지합니다.
      // 만약 기존 이미지를 미리보기로 보여줘야 한다면, 추가적인 로직이 필요합니다.
    }
  }, [product]);

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

    return isValid;
  };

  const productUpdate = async (e) => {
    e.preventDefault();

    // 폼 유효성 검사 수행 (이미지 필드는 수정 모드이므로 필수 아님)
    // 필수 텍스트/숫자 필드만 여기서 유효성 검사
    const isFormValid = validateForm();
    if (!isFormValid) {
      alert('상품명, 제품 설명, 카테고리, 가격, 재고수량은 필수 항목입니다.');
      return; // 유효성 검사 실패 시 함수 종료
    }

    try {
      const updateData = new FormData();
      updateData.append('name', name);
      updateData.append('description', description);
      updateData.append('categoryId', categoryId);
      updateData.append('price', price);
      updateData.append('stockQuantity', stockQuantity);

      // 새로 선택된 이미지들만 FormData에 추가
      if (productImages.length > 0) {
        productImages.forEach((file) => {
          updateData.append('images', file);
        });
      }
      if (thumbnailImage) {
        updateData.append('thumbnailImage', thumbnailImage);
      }
      if (mainImage) {
        updateData.append('mainImage', mainImage);
      }

      await axiosInstance.patch(`${API_BASE_URL}${PROD}/update`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { id: id },
      });
      console.log(updateData);
      alert('상품 수정이 성공적으로 완료되었습니다!');
      navigate(`/product/detail/${id}`);
    } catch (e) {
      console.error('상품 수정 실패:', e);
      handleAxiosError(e, onLogout, navigate);
      alert('상품 수정에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // 사용자가 파일을 선택해서 업로드하면 정보를 읽어들여서
  // 썸네일 띄우는 함수
  const fileUpdate = () => {
    const file = $fileTag.current.files[0];
    setThumbnailImage(file);
    if (file) setThumbnailImageError(false); // 파일 선택 시 에러 초기화
  };

  const handleDetailImageUpload = () => {
    const newImages = Array.from($detailRef.current.files);
    setProductImages((prev) => {
      const updatedImages = [...prev, ...newImages];
      if (updatedImages.length > 0) {
        // 상세 이미지가 추가되면 오류 초기화
        setProductImagesError(false);
      }
      return updatedImages;
    });
  };

  const handleMainImageUpload = () => {
    const mainImage = $mainRef.current.files[0];
    setMainImage(mainImage);
    if (mainImage) setMainImageError(false); // 파일 선택 시 에러 초기화
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='상품수정' style={{ textAlign: 'center' }} />
            <CardContent>
              <Typography
                variant='body2'
                color='textSecondary'
                sx={{ mb: 2, textAlign: 'center' }}
              >
                <span style={{ color: 'red', fontWeight: 'bold' }}>*</span> 는
                필수 항목입니다.
              </Typography>
              <form onSubmit={productUpdate}>
                <TextField
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
                  error={stockQuantityError}
                  helperText={
                    stockQuantityError &&
                    '재고수량을 0보다 큰 숫자로 입력해주세요.'
                  }
                />

                <Box sx={{ my: 3 }}>
                  <Typography variant='subtitle1'>
                    썸네일 이미지 (미업로드시 기존 이미지가 유지됩니다.)
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
                  {/* 수정 모드에서는 이미지가 필수가 아니므로 에러 메시지 주석 처리
                  {thumbnailImageError && (
                    <Typography variant='caption' color='error' sx={{ ml: 1 }}>
                      썸네일 이미지는 필수입니다.
                    </Typography>
                  )}
                  */}
                </Box>
                <Box sx={{ my: 3 }}>
                  <Typography variant='subtitle1'>
                    대표 이미지 (미업로드시 기존 이미지가 유지됩니다.)
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
                  {/* 수정 모드에서는 이미지가 필수가 아니므로 에러 메시지 주석 처리
                  {mainImageError && (
                    <Typography variant='caption' color='error' sx={{ ml: 1 }}>
                      대표 이미지는 필수입니다.
                    </Typography>
                  )}
                  */}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle1'>
                    상세 이미지 (미업로드시 기존 이미지가 유지됩니다.)
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
                  {/* 수정 모드에서는 이미지가 필수가 아니므로 에러 메시지 주석 처리
                  {productImagesError && (
                    <Typography variant='caption' color='error' sx={{ ml: 1 }}>
                      상세 이미지는 최소 1개 이상 필요합니다.
                    </Typography>
                  )}
                  */}
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
                  수정
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductUpdate;
