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
import { API_BASE_URL, PROD } from '../configs/host-config';
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

  const { id } = useParams();
  useEffect(() => {
    const fetchDetail = async () => {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${PROD}/detail/${id}`,
      );
      setProduct(res.data.result);
    };
    fetchDetail();
  }, [id]);

  const navigate = useNavigate();
  const { onLogout } = useContext(AuthContext);

  // useRef를 사용하여 특정 요소를 참조하기
  const $fileTag = useRef();
  const $mainRef = useRef();
  const $detailRef = useRef();

  const productUpdate = async (e) => {
    e.preventDefault();

    try {
      const registData = new FormData();
      registData.append('name', name);
      registData.append('description', description);
      registData.append('categoryId', categoryId);
      registData.append('price', price);
      registData.append('stockQuantity', stockQuantity);
      if (productImages) {
        productImages.forEach((file) => {
          registData.append('images', file); // 🔥 key는 같게, append는 반복!
        });
      }
      if (thumbnailImage) registData.append('thumbnailImage', thumbnailImage);
      if (mainImage) registData.append('mainImage', mainImage);

      // axiosInstance의 기본 컨텐트 타입은 JSON -> JSON 보낼 때는 개꿀
      // 지금 우리가 보내야 되는 컨텐트는 FormData -> multipart/form-data 직접 명시
      await axiosInstance.patch(`${API_BASE_URL}${PROD}/update`, registData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { id: id },
      });
      console.log(registData);
    } catch (e) {
      handleAxiosError(e, onLogout, navigate);
    }
    alert('상품 수정 완료!');
    navigate(`/product/detail/${id}`);
  };

  // 사용자가 파일을 선택해서 업로드하면 정보를 읽어들여서
  // 썸네일 띄우는 함수
  const fileUpdate = () => {
    const file = $fileTag.current.files[0];

    setThumbnailImage(file);
  };

  const handleDetailImageUpload = () => {
    const newImages = Array.from($detailRef.current.files);
    setProductImages((prev) => [...prev, ...newImages]);
  };

  const handleMainImageUpload = () => {
    const mainImage = $mainRef.current.files[0];
    setMainImage(mainImage);
  };
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setStockQuantity(product.stockQuantity);
      setCategoryId(product.categoryId);
    }
  }, [product]);

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='상품수정' style={{ textAlign: 'center' }} />
            <CardContent>
              <form onSubmit={productUpdate}>
                <TextField
                  label='상품명'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
                />
                <TextField
                  label='제품 설명'
                  multiline
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  variant='outlined'
                  placeholder='제품에 대한 자세한 내용을 입력해 주세요.'
                />
                <TextField
                  select
                  label='카테고리'
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
                >
                  <MenuItem value='선택'>선택</MenuItem>
                  <MenuItem value='1'>Doodle Persian</MenuItem>
                  <MenuItem value='2'>É</MenuItem>
                  <MenuItem value='3'>Textiles</MenuItem>
                  <MenuItem value='4'>Homedeco</MenuItem>
                  <MenuItem value='5'>Mirror</MenuItem>
                  <MenuItem value='6'>Lighting</MenuItem>
                  <MenuItem value='7'>Lifestyle</MenuItem>
                  <MenuItem value='8'>Goods</MenuItem>
                  <MenuItem value='9'>dummy</MenuItem>
                </TextField>
                <TextField
                  label='가격'
                  type='number'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
                />
                <TextField
                  label='재고수량'
                  type='number'
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
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
                      color: '#000000', // 글씨 검정
                      borderColor: '#000000', // 테두리 검정
                      '&:hover': {
                        backgroundColor: '#000000', // 호버 시 배경 검정
                        color: '#ffffff', // 호버 시 글씨 흰색
                        borderColor: '#000000', // 호버 시 테두리 유지
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
                      color: '#000000', // 글씨 검정
                      borderColor: '#000000', // 테두리 검정
                      '&:hover': {
                        backgroundColor: '#000000', // 호버 시 배경 검정
                        color: '#ffffff', // 호버 시 글씨 흰색
                        borderColor: '#000000', // 호버 시 테두리 유지
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
                      color: '#000000', // 글씨 검정
                      borderColor: '#000000', // 테두리 검정
                      '&:hover': {
                        backgroundColor: '#000000', // 호버 시 배경 검정
                        color: '#ffffff', // 호버 시 글씨 흰색
                        borderColor: '#000000', // 호버 시 테두리 유지
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
                </Box>
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  sx={{
                    backgroundColor: '#000000', // 검정 배경
                    color: '#ffffff', // 흰색 글씨
                    '&:hover': {
                      backgroundColor: '#333333', // 호버 시 약간 밝은 검정
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

export default ProductUpdate;
