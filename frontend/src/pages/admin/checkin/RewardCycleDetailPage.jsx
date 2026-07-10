import React from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { useParams } from 'react-router-dom';

function RewardCycleDetailPage() {
  const { id } = useParams();
  return <AdminLayout><div><h1>Chi tiết chuỗi phần thưởng {id}</h1></div></AdminLayout>;
}

export default RewardCycleDetailPage;