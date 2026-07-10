import React from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { useParams } from 'react-router-dom';

function CheckInUserDetailPage() {
  const { userId } = useParams();
  return <AdminLayout><div><h1>Chi tiết người dùng {userId}</h1></div></AdminLayout>;
}

export default CheckInUserDetailPage;