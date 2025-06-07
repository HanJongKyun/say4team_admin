import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import './OrderList.css';

const ORDER_STATUSES = [
  '----',
  '주문완료',
  '배송중',
  '배송완료',
  '주문취소',
  '반품완료',
];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState('latest'); // "latest" or "product"
  const observerRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/orders', {
        params: { page, sort },
      });

      const newOrders = response.data;

      if (newOrders.length === 0) {
        setHasMore(false);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error('주문 데이터를 불러오는 데 실패했습니다:', err);
    }
  }, [page, sort]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (err) {
      console.error('상태 변경 실패:', err);
    }
  };

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchOrders();
      }
    });

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [fetchOrders, hasMore]);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
  }, [sort]);

  useEffect(() => {
    if (orders.length === 0 && hasMore) {
      fetchOrders();
    }
  }, [orders.length, hasMore, fetchOrders]);

  return (
    <div className='admin-order-page'>
      <h2>전체 주문 관리</h2>

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
        {orders.map((order) => (
          <div key={order.id} className='order-card'>
            <div>주문 ID: {order.id}</div>
            <div>사용자: {order.userName}</div>
            <div>상품: {order.productName}</div>
            <div>수량: {order.quantity}</div>
            <label>
              상태:{' '}
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className='selectlist'
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      <div ref={observerRef} style={{ height: '1px' }}></div>
      {!hasMore && (
        <p style={{ textAlign: 'center' }}>모든 주문을 불러왔습니다.</p>
      )}
    </div>
  );
};

export default OrderList;