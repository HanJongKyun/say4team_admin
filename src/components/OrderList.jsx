import React, { useEffect, useRef, useState, useCallback } from 'react';
import axiosInstance from '../configs/axios-config';
import './OrderList.css';
import { API_BASE_URL, ORDER } from '../configs/host-config';

const ORDER_STATUSES = [
  '----',
  'ORDERED',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
  'RETURNED',
];

const getOrderStatusLabel = (status) => {
  switch (status) {
    case 'ORDERED':
      return '주문완료';
    case 'SHIPPED':
      return '배송중';
    case 'DELIVERED':
      return '배송완료';
    case 'CANCELED':
      return '주문취소';
    case 'RETURNED':
      return '반품완료';
    default:
      return status;
  }
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState('latest');

  const observerRef = useRef(null);
  const fetchingRef = useRef(false);
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const sortRef = useRef(sort);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    sortRef.current = sort;
  }, [sort]);

  const fetchOrders = useCallback(async () => {
    if (fetchingRef.current || !hasMoreRef.current) return;
    fetchingRef.current = true;

    try {
      const url = `${API_BASE_URL}${ORDER}/admin/all`;
      const response = await axiosInstance.get(url, {
        params: { page: pageRef.current, sort: sortRef.current },
      });

      const newOrders = response.data;

      if (!newOrders || newOrders.length === 0) {
        setHasMore(false);
      } else {
        setOrders((prev) => {
          const existingIds = new Set(prev.map((order) => order.orderId));
          const filteredNewOrders = newOrders.filter(
            (order) => !existingIds.has(order.orderId),
          );
          return [...prev, ...filteredNewOrders];
        });
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error('주문 데이터를 불러오는 데 실패했습니다:', err);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const currentObserverTarget = observerRef.current;
    if (!currentObserverTarget) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchOrders();
      }
    });

    observer.observe(currentObserverTarget);

    return () => {
      if (currentObserverTarget) observer.unobserve(currentObserverTarget);
      observer.disconnect();
    };
  }, [fetchOrders]);

  useEffect(() => {
    // 정렬 변경 시 초기화
    setOrders([]);
    setPage(1);
    setHasMore(true);
    fetchingRef.current = false;
  }, [sort]);

  useEffect(() => {
    if (page === 1 && hasMore) {
      fetchOrders();
    }
  }, [page, hasMore, fetchOrders]);

  const handleStatusChange = async (orderId, orderItemId, newStatus) => {
    const confirmChange = window.confirm(
      `주문 상태를 "${getOrderStatusLabel(newStatus)}"로 변경하시겠습니까?`,
    );
    if (!confirmChange) return;

    try {
      const url = `${API_BASE_URL}${ORDER}/items/${orderItemId}/status`;
      await axiosInstance.put(url, null, {
        params: { status: newStatus },
      });

      setOrders((prev) =>
        prev.map((order) => {
          if (order.orderId !== orderId) return order;
          return {
            ...order,
            orderItems: order.orderItems.map((item) =>
              item.orderItemId === orderItemId
                ? { ...item, orderStatus: newStatus }
                : item,
            ),
          };
        }),
      );
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className='admin-order-page'>
      <h2>전체 주문 관리 (관리자)</h2>

      <div className='sort-controls'>
        <button
          onClick={() => setSort('latest')}
          className={sort === 'latest' ? 'active' : ''}
        >
          최신순
        </button>
        <button
          onClick={() => setSort('product')}
          className={sort === 'product' ? 'active' : ''}
        >
          상품 정렬
        </button>
      </div>

      <div className='order-list'>
        {orders.length === 0 && <p>주문 내역이 없습니다.</p>}

        {orders.flatMap((order) =>
          order.orderItems.map((item) => {
            const imageUrl = item.mainImagePath;
            const orderDate = order.orderedAt
              ? new Date(order.orderedAt).toLocaleDateString()
              : '알 수 없음';

            return (
              <div
                key={`${order.orderId}-${item.orderItemId}`}
                className='order-card'
              >
                <div>
                  <b>주문 ID:</b> {order.orderId}
                </div>
                <div>
                  <b>사용자:</b> {order.email || '알 수 없음'}
                </div>
                <div>
                  <strong>주문 날짜:</strong> {orderDate}
                </div>
                <div>
                  <b>총 금액:</b>{' '}
                  {(item.unitPrice * item.quantity).toLocaleString()}원
                </div>

                <div className='product-info-container'>
                  <div className='product-image-wrapper'>
                    <img
                      src={imageUrl || '/default-image.png'}
                      alt={item.productName || '상품 이미지'}
                      className='order-image'
                    />
                  </div>

                  <div className='product-details'>
                    <div>
                      <b>상품명:</b> {item.productName || '상품 정보 없음'}
                    </div>
                    <div>
                      <b>수량:</b> {item.quantity}
                    </div>
                    <div>
                      <b>단가:</b> {item.unitPrice.toLocaleString()}원
                    </div>
                  </div>
                </div>

                <label>
                  <b>상태:</b>{' '}
                  <select
                    value={item.orderStatus || '----'}
                    onChange={(e) =>
                      handleStatusChange(
                        order.orderId,
                        item.orderItemId,
                        e.target.value,
                      )
                    }
                    className='selectlist'
                    disabled={item.orderStatus === 'CANCELED'}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getOrderStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          }),
        )}
      </div>

      <div ref={observerRef} style={{ height: '1px' }}></div>
      {!hasMore && orders.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          모든 주문을 불러왔습니다.
        </p>
      )}
    </div>
  );
};

export default OrderList;
