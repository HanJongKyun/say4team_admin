import {
  Button,
  Card,
  CardContent,
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
  Checkbox, // 체크박스 사용을 위해 임포트 추가
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/UserContext';
import { replace, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { throttle } from 'lodash';
import { API_BASE_URL, CATEGORY } from '../configs/host-config'; // PROD 대신 CATEGORY를 사용하고 계실 수 있습니다.
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import CategoryCreateModal from './CategoryFormModal'; // 예시 경로, 실제 경로에 맞게 수정해주세요!
import axiosInstance from '../configs/axios-config';
import CategoryFormModal from './CategoryFormModal';

const CategoryList = ({ pageTitle }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn) {
    alert('로그인하세요');
    navigate('/', { replace: true });
    return null;
  }

  // --- 상태 변수 정의 ---
  const [searchType, setSearchType] = useState('ALL');
  const [searchValue, setSearchValue] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // ★ 수정할 카테고리 데이터를 담을 새로운 상태 추가 ★
  const [editingCategory, setEditingCategory] = useState(null); // 수정 모드일 때 여기에 데이터가 들어감
  const pageSize = 15;

  // --- 모달 관련 상태 변수 ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 체크박스 선택 관련 상태 변수 ---
  const [selectedCategories, setSelectedCategories] = useState(new Set()); // Set을 사용하여 선택된 카테고리 ID 관리

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'ADMIN';

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

  // --- 초기 로드 및 스크롤 페이징 관련 이펙트 ---
  useEffect(() => {
    loadCategories();

    const throttledScroll = throttle(scrollPagination, 1000);
    window.addEventListener('scroll', throttledScroll);

    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // currentPage 변경 시 카테고리 목록 요청
  useEffect(() => {
    if (currentPage > 0) {
      loadCategories();
    }
  }, [currentPage]);

  // --- 카테고리 목록을 백엔드에 요청하는 함수 ---
  const loadCategories = async () => {
    if (isLoading || isLastPage) return;

    console.log('아직 보여줄 컨텐츠 더 있음!');

    const params = {
      size: pageSize,
      page: currentPage,
    };

    params.searchType = searchType;
    params.searchName = searchValue;

    console.log('백엔드로 보낼 params: ', params);

    setIsLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}${CATEGORY}/list?sort=categoryId,DESC`,
        { params },
      );

      console.log(res);

      const data = res.data;

      if (Array.isArray(data)) {
        console.log('data.length: ', data.length);
        if (data.length === 0) {
          setIsLastPage(true);
        } else {
          // 중복 방지 필터링 로직 포함 (이전 요청에서 추가됨)
          setCategoryList((prevList) => {
            const newItems = data.filter(
              (newItem) =>
                !prevList.some(
                  (existingItem) =>
                    existingItem.categoryId === newItem.categoryId,
                ),
            );
            return [...prevList, ...newItems];
          });
        }
      } else {
        console.error(
          '백엔드로부터 예상치 못한 데이터 형식을 받았습니다:',
          data,
        );
        setIsLastPage(true);
      }
    } catch (e) {
      console.error('카테고리 로드 중 에러 발생:', e);
      if (
        e.response &&
        e.response.status === 404 &&
        e.response.data === '카테고리가 없습니다.'
      ) {
        setIsLastPage(true);
        console.log("백엔드로부터 '카테고리가 없습니다.' 응답을 받았습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 스크롤 페이징 처리 함수 ---
  const scrollPagination = () => {
    const isBottom =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.scrollHeight - 100;

    if (isBottom && !isLastPage && !isLoading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleCategoryClick = (categoryId) => {
    // 해당 카테고리의 현재 선택 상태를 반전시켜 handleCheckboxChange 호출
    handleCheckboxChange(categoryId, !selectedCategories.has(categoryId));
  };

  // --- 모달 열기 핸들러 ---
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // --- 모달 닫기 핸들러 ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // 모달 닫기 후 목록을 새로고침
    setCategoryList([]);
    setCurrentPage(0);
    setIsLastPage(false);
    setIsLoading(false);

    loadCategories(); // 상태 초기화 후 첫 페이지 데이터 로드
  };

  // --- 체크박스 변경 핸들러 ---
  const handleCheckboxChange = (categoryId, isChecked) => {
    setSelectedCategories((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(categoryId);
      } else {
        newSelected.delete(categoryId);
      }
      return newSelected;
    });
  };

  // --- 선택된 카테고리 삭제 핸들러 (관리자용) ---
  const handleDeleteSelected = async () => {
    if (selectedCategories.size === 0) {
      alert('삭제할 카테고리를 선택하세요.');
      return;
    }
    if (
      !window.confirm(
        `선택된 ${selectedCategories.size}개의 카테고리를 정말 삭제하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      const idsToDelete = Array.from(selectedCategories);
      const res = await axiosInstance.delete(
        `${API_BASE_URL}${CATEGORY}/delete`,
        {
          // CATEGORY 상수 사용
          data: { categoryIds: idsToDelete },
        },
      );
      console.log('삭제 응답:', res);
      alert('선택된 카테고리가 삭제되었습니다.');
      setSelectedCategories(new Set());
      setCategoryList([]);
      setCurrentPage(0);
      setIsLastPage(false);
      setIsLoading(false);

      loadCategories();
    } catch (e) {
      console.error('카테고리 삭제 중 에러 발생:', e);
      alert('카테고리 삭제에 실패했습니다.');
    }
  };

  // --- 선택된 카테고리 수정 핸들러 (관리자용) ---
  const handleUpdateSelected = () => {
    if (selectedCategories.size !== 1) {
      alert('수정할 카테고리는 하나만 선택해주세요.');
      return;
    }
    const categoryIdToUpdate = selectedCategories.values().next().value;
    // 선택된 카테고리 ID로 실제 카테고리 객체를 찾아서 모달에 전달
    const foundCategory = categoryList.find(
      (cat) => cat.categoryId === categoryIdToUpdate,
    );

    if (foundCategory) {
      setEditingCategory(foundCategory); // ★ 여기가 TODO 해결 1: 수정할 카테고리 데이터를 상태에 저장
      setIsModalOpen(true); // ★ 여기가 TODO 해결 2: 모달 열기
    } else {
      alert('선택된 카테고리 데이터를 찾을 수 없습니다.');
    }
  };

  // --- 렌더링 부분 ---
  return (
    <Container sx={{ mt: 5, mb: 10 }}>
      {/* 검색 및 카테고리 등록/수정/삭제 버튼 섹션 */}
      <Grid
        container
        justifyContent='space-between'
        alignItems='center'
        spacing={2}
        sx={{ mb: 4 }}
      >
        {/* 관리자 버튼 섹션 */}
        {isAdmin && (
          <Grid
            item
            xs={12}
            md='auto'
            sx={{ display: 'flex', justifyContent: 'flex-end' }} // 버튼들을 오른쪽으로 정렬
          >
            <Grid container spacing={1}>
              {/* 카테고리 등록 버튼 */}
              <Grid item>
                <Button
                  variant='contained'
                  color='success'
                  onClick={handleOpenModal}
                >
                  카테고리 등록
                </Button>
              </Grid>

              {/* 선택된 카테고리가 1개일 때만 보이는 수정 버튼 */}
              {selectedCategories.size === 1 && (
                <Grid item>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleUpdateSelected}
                  >
                    선택 카테고리 수정
                  </Button>
                </Grid>
              )}

              {/* 선택된 카테고리가 1개 이상일 때만 보이는 삭제 버튼 */}
              {selectedCategories.size > 0 && (
                <Grid item>
                  <Button
                    variant='contained'
                    color='error'
                    onClick={handleDeleteSelected}
                  >
                    선택 카테고리 삭제
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
      {/* 카테고리 목록 테이블 */}
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
                <React.Fragment>
                  {isAdmin && <TableCell>선택</TableCell>}
                  <TableCell>카테고리 배경이미지</TableCell>
                  <TableCell>카테고리 ID</TableCell>
                  <TableCell>카테고리 이름</TableCell>
                </React.Fragment>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryList.length > 0 ? (
                categoryList.map((category) => (
                  <TableRow
                    key={category.categoryId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleCategoryClick(category.categoryId)}
                  >
                    <React.Fragment>
                      {isAdmin && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedCategories.has(
                              category.categoryId,
                            )}
                            onChange={(e) =>
                              handleCheckboxChange(
                                category.categoryId,
                                e.target.checked,
                              )
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <img
                          src={category.categoryBgImgUrl}
                          alt={category.categoryName}
                          style={{
                            height: '100px',
                            width: 'auto',
                            borderRadius: '8px',
                            objectFit: 'cover',
                          }}
                        />
                      </TableCell>
                      <TableCell>{category.categoryId}</TableCell>
                      <TableCell>{category.categoryName}</TableCell>
                    </React.Fragment>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} align='center'>
                    {isLoading
                      ? '카테고리를 로딩 중입니다...'
                      : '등록된 카테고리가 없습니다.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* 스크롤 상단 이동 버튼 */}
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

      {isModalOpen && (
        <CategoryFormModal // ★ 여기가 TODO 해결 3: 수정할 카테고리 데이터를 모달에 prop으로 전달
          open={isModalOpen}
          onClose={handleCloseModal}
          categoryData={editingCategory} // <-- 이 props를 통해 categoryData를 CategoryFormModal로 전달
          onSaveSuccess={handleCloseModal} // 저장 성공 시 호출될 콜백 (목록 새로고침 유도)
        />
      )}
    </Container>
  );
};

export default CategoryList;
