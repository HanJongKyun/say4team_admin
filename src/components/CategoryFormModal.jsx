import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from '@mui/material';

import { API_BASE_URL, CATEGORY } from '../configs/host-config';
import axiosInstance from '../configs/axios-config';

const CategoryFormModal = ({ open, onClose, categoryData, onSaveSuccess }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryBgImg, setCategoryBgImg] = useState(null); // 새로 선택된 파일 (File 객체)
  const [previewImageUrl, setPreviewImageUrl] = useState(''); // 미리보기 이미지 URL (string)

  const isUpdateMode = !!categoryData;

  useEffect(() => {
    // 모달이 열리거나 categoryData가 변경될 때마다 초기화
    if (open) {
      // 모달이 열릴 때만 상태 초기화
      if (isUpdateMode) {
        setCategoryName(categoryData.categoryName || '');
        setPreviewImageUrl(categoryData.categoryBgImgUrl || ''); // 기존 URL을 미리보기로 설정
        setCategoryBgImg(null); // 파일 입력 초기화
      } else {
        setCategoryName('');
        setPreviewImageUrl(''); // 생성 모드일 때 미리보기 URL 초기화
        setCategoryBgImg(null); // 파일 입력 초기화
      }
    }
  }, [open, categoryData, isUpdateMode]);

  // categoryBgImg(선택된 파일)이 변경될 때마다 미리보기 URL 업데이트
  useEffect(() => {
    if (categoryBgImg) {
      const fileUrl = URL.createObjectURL(categoryBgImg);
      setPreviewImageUrl(fileUrl);
      // 컴포넌트 언마운트 또는 파일 변경 시 URL 해제 (메모리 누수 방지)
      return () => URL.revokeObjectURL(fileUrl);
    } else if (!isUpdateMode && !categoryBgImg) {
      // 생성 모드에서 파일이 없으면 미리보기 URL도 없앰
      setPreviewImageUrl('');
    }
  }, [categoryBgImg, isUpdateMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryBgImg(file); // 새 파일 저장
      // setPreviewImageUrl(URL.createObjectURL(file)); // 미리보기 URL은 useEffect에서 처리
    } else {
      setCategoryBgImg(null);
    }
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('categoryName', categoryName);

    if (categoryBgImg) {
      formData.append('categoryBgImg', categoryBgImg);
    }
    // 백엔드에서 이미지 업데이트가 없는 경우 기존 이미지 URL을 유지하는 로직
    // 보통 백엔드가 MultipartFile이 null이면 기존 이미지를 유지하도록 설계됩니다.
    // 명시적으로 "기존 이미지 유지" 신호를 보내려면, 백엔드 API 명세에 따라 추가 필드를 사용해야 합니다.
    // 예: formData.append('maintainExistingImage', (!categoryBgImg && isUpdateMode && existingBgImgUrl) ? 'true' : 'false');

    try {
      if (isUpdateMode) {
        formData.append('categoryId', categoryData.categoryId);
        await axiosInstance.put(`${API_BASE_URL}${CATEGORY}/update`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('카테고리가 성공적으로 수정되었습니다.');
      } else {
        await axiosInstance.post(
          `${API_BASE_URL}${CATEGORY}/create`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );
        alert('카테고리가 성공적으로 등록되었습니다.');
      }
      onClose(); // 모달 닫기
      if (onSaveSuccess) {
        onSaveSuccess(); // 부모 컴포넌트에 성공 알림
      }
    } catch (e) {
      console.error('카테고리 저장 중 에러 발생:', e);
      alert(`카테고리 ${isUpdateMode ? '수정' : '등록'}에 실패했습니다.`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {isUpdateMode ? '카테고리 수정' : '새 카테고리 등록'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='카테고리 이름'
          type='text'
          fullWidth
          variant='outlined'
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          sx={{ mb: 2 }}
        />
        {/* 미리보기 이미지 표시 로직 통합 */}
        {previewImageUrl && ( // previewImageUrl이 있을 때만 표시
          <Typography variant='body2' sx={{ mt: 1, mb: 1 }}>
            {isUpdateMode ? '현재/새 이미지:' : '미리보기 이미지:'}{' '}
            <img
              src={previewImageUrl} // 미리보기 URL 사용
              alt='미리보기 이미지'
              style={{
                maxWidth: '80px',
                maxHeight: '80px',
                objectFit: 'cover',
              }}
            />
          </Typography>
        )}
        <Button variant='contained' component='label'>
          {isUpdateMode ? '새 이미지 업로드' : '배경 이미지 업로드'}
          <input type='file' hidden onChange={handleFileChange} />
        </Button>
        {categoryBgImg && ( // 파일이 선택되었을 때만 파일 이름 표시
          <Typography variant='body2' sx={{ mt: 1 }}>
            선택된 파일: {categoryBgImg.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          취소
        </Button>
        <Button onClick={handleSubmit} color='primary' variant='contained'>
          {isUpdateMode ? '수정' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormModal;
