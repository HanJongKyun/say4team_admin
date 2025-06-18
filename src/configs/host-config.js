// 브라우저에서 현재 클라이언트의 호스트 이름을 얻어오기
const clientHostName = window.location.hostname;

let backendHostName;

if (clientHostName === 'localhost') {
  // 개발 중
  backendHostName = 'http://localhost:8000';
} else if (clientHostName === 'say4teamadmin.shop') {
  // 배포해서 현재 서비스 중
  backendHostName = 'http://52.79.181.208:8000';
}

export const API_BASE_URL = backendHostName;
export const USER = '/user-service/user';
export const PROD = '/product-service/product';
export const CATEGORY = '/product-service/category';
export const ORDER = '/ordering-service/orders';
export const SSE = '/ordering-service';
