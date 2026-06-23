import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "../../services/productService";
import ProductFilterBar from "./products/ProductFilterBar";
import ProductList from "./products/ProductList";
import ProductPagination from "./products/ProductPagination";
import ProductFormModal from "./products/ProductFormModal";

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filtering state
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Discount Modal State
  const [discountModal, setDiscountModal] = useState({ show: false, product: null, discountPrice: "" });

  // Status message
  const [statusMsg, setStatusMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({ sort: "newest" }),
        getCategories()
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error(error);
      showStatus("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (message, type = "success") => {
    setStatusMsg({ message, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // --- Filter Logic ---
  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const { search, category, status, stock, isNew, isSale, isBestSeller, priceMin, priceMax } = appliedFilters;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        (p.name || p.productName || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.slug || "").toLowerCase().includes(q)
      );
    }
    if (category) {
      result = result.filter(p => String(p.categoryId || p.category) === String(category));
    }
    if (status) {
      result = result.filter(p => p.status === status);
    }
    if (stock) {
      if (stock === "in_stock") result = result.filter(p => (p.quantity || p.availability) > 5);
      if (stock === "low_stock") result = result.filter(p => (p.quantity || p.availability) > 0 && (p.quantity || p.availability) <= 5);
      if (stock === "out_of_stock") result = result.filter(p => (p.quantity || p.availability) <= 0);
    }
    if (isNew) result = result.filter(p => Boolean(p.newArrival) === (isNew === "true"));
    if (isSale) result = result.filter(p => Boolean(p.onSale) === (isSale === "true"));
    if (isBestSeller) result = result.filter(p => Boolean(p.featured) === (isBestSeller === "true"));
    if (priceMin) result = result.filter(p => (p.price || 0) >= Number(priceMin));
    if (priceMax) result = result.filter(p => (p.price || 0) <= Number(priceMax));

    return result;
  }, [products, appliedFilters]);

  // --- Pagination Logic ---
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // --- Selection Logic ---
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // --- Actions ---
  const handleDeleteSelected = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} sản phẩm đã chọn?`)) return;
    
    setLoading(true);
    let successCount = 0;
    // Sequential delete as bulk delete API is not available
    for (const id of selectedIds) {
      try {
        await deleteProduct(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete ${id}`, e);
      }
    }
    
    showStatus(`Đã xóa thành công ${successCount}/${selectedIds.length} sản phẩm.`);
    setSelectedIds([]);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      showStatus("Xóa sản phẩm thành công!");
      loadData();
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (error) {
      showStatus("Xóa sản phẩm thất bại!", "error");
    }
  };

  const handleToggleFeature = async (id, featureName, value) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (featureName === 'onSale') {
      let newPayload = { ...product };
      
      if (value === true) {
        // Bật Khuyến Mãi -> Mở Modal nhập giá
        setDiscountModal({ show: true, product, discountPrice: "" });
        return; // Kết thúc sớm, chờ modal
      } else {
        // Tắt Khuyến Mãi -> Khôi phục giá gốc
        if (product.originalPrice && product.originalPrice > product.price) {
          newPayload.price = product.originalPrice; // Phục hồi giá bán bằng giá gốc
          newPayload.originalPrice = null;          // Xóa giá gốc đi
        }
        newPayload.onSale = false;
        
        // Nếu nhãn đang là SALE, xóa luôn để tránh backend ép bật lại
        if (product.badge && product.badge.toUpperCase() === 'SALE') {
          newPayload.badge = null;
        }
      }
      
      // Thực hiện gọi API ngay với payload tùy chỉnh này
      try {
        const res = await updateProduct(id, newPayload);
        if (res && res.data) {
          setProducts(prev => prev.map(p => p.id === id ? res.data : p));
        }
        showStatus("Cập nhật khuyến mãi thành công!");
      } catch (error) {
        showStatus("Cập nhật khuyến mãi thất bại!", "error");
      }
      return; // Kết thúc sớm, không chạy logic bên dưới
    }

    if (featureName === 'displayOrder') {
      let currentPayload = { ...product, displayOrder: value };
      setProducts(prev => prev.map(p => p.id === id ? { ...p, displayOrder: value } : p));
      try {
        const res = await updateProduct(id, currentPayload);
        if (res && res.data) {
          setProducts(prev => prev.map(p => p.id === id ? res.data : p));
        }
        showStatus("Cập nhật thứ tự thành công!");
      } catch (error) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, displayOrder: product.displayOrder } : p));
        showStatus("Cập nhật thất bại!", "error");
      }
      return;
    }

    // Xử lý tự động xóa Badge nếu người dùng tắt nút New hoặc Hot
    let currentPayload = { ...product, [featureName]: value };
    
    if (featureName === 'newArrival' && value === false && product.badge && product.badge.toUpperCase() === 'NEW') {
      currentPayload.badge = null;
    }
    if (featureName === 'featured' && value === false && product.badge && product.badge.toUpperCase() === 'HOT') {
      currentPayload.badge = null;
    }

    // Optimistic update
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [featureName]: value } : p));

    try {
      const res = await updateProduct(id, currentPayload);
      
      // Đồng bộ lại state với data thực tế từ backend trả về
      if (res && res.data) {
        setProducts(prev => prev.map(p => p.id === id ? res.data : p));
      }
      showStatus("Cập nhật trạng thái thành công!");
    } catch (error) {
      // Revert on error
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [featureName]: !value } : p));
      showStatus("Cập nhật thất bại!", "error");
    }
  };

  const handleConfirmDiscount = async () => {
    const { product, discountPrice } = discountModal;
    if (!product) return;
    
    const price = Number(discountPrice);
    if (isNaN(price) || price <= 0 || price >= product.price) {
       alert("Giá khuyến mãi không hợp lệ! Vui lòng nhập một số lớn hơn 0 và NHỎ HƠN giá hiện tại.");
       return;
    }
    
    let newPayload = { ...product };
    newPayload.originalPrice = product.price;
    newPayload.price = price;
    newPayload.onSale = true;
    
    try {
      const res = await updateProduct(product.id, newPayload);
      if (res && res.data) {
        setProducts(prev => prev.map(p => p.id === product.id ? res.data : p));
      }
      showStatus("Cập nhật khuyến mãi thành công!");
      setDiscountModal({ show: false, product: null, discountPrice: "" });
    } catch (error) {
      showStatus("Cập nhật khuyến mãi thất bại!", "error");
    }
  };

  const handleExportCSV = () => {
    // Determine data to export (if items selected, export those, else export filtered)
    const exportData = selectedIds.length > 0 
      ? products.filter(p => selectedIds.includes(p.id))
      : filteredProducts;

    if (exportData.length === 0) {
      showStatus("Không có dữ liệu để xuất!", "error");
      return;
    }

    const headers = ["ID", "Tên sản phẩm", "SKU", "Slug", "Giá bán", "Giá gốc", "Tồn kho", "Danh mục ID", "Trạng thái", "Mới", "Khuyến mãi", "Bán chạy", "Ảnh đại diện"];
    const csvContent = [
      headers.join(","),
      ...exportData.map(p => [
        p.id,
        `"${(p.name || p.productName || "").replace(/"/g, '""')}"`,
        p.sku,
        p.slug,
        p.price,
        p.originalPrice || "",
        p.quantity || p.availability || 0,
        p.categoryId || p.category,
        p.status,
        p.newArrival ? "Yes" : "No",
        p.onSale ? "Yes" : "No",
        p.featured ? "Yes" : "No",
        `"${p.imageUrl || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus("Đã xuất CSV thành công!");
  };

  const mapFormToPayload = (form) => ({
    name: form.name,
    slug: form.slug || null,
    sku: form.sku || null,
    description: form.description || null,
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
    quantity: Number(form.quantity),
    imageUrl: form.imageUrl || null,
    imageUrls: form.imageUrls ? form.imageUrls.split(",").map(s => s.trim()).filter(Boolean) : [],
    categoryId: String(form.categoryId),
    status: form.status || "ACTIVE",
    featured: Boolean(form.featured),
    newArrival: Boolean(form.newArrival),
    onSale: Boolean(form.onSale),
  });

  const handleSubmitForm = async (formData) => {
    setLoading(true);
    try {
      const payload = mapFormToPayload(formData);
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showStatus("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(payload);
        showStatus("Thêm sản phẩm mới thành công!");
      }
      setShowModal(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error(error);
      showStatus("Lưu sản phẩm thất bại!", "error");
      setLoading(false); // only stop loading on error, on success loadData will handle it
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "var(--admin-text)" }}>Quản lý sản phẩm</h3>
            <p className="mb-0 text-muted">Quản lý danh sách sản phẩm, tồn kho, trạng thái và hiển thị trên các trang liên quan.</p>
          </div>
          <div className="d-flex gap-3 align-items-center">
            {statusMsg && (
              <div className={`badge bg-${statusMsg.type === 'error' ? 'danger' : 'success'} px-3 py-2 rounded-pill shadow-sm animate__animated animate__fadeIn`}>
                {statusMsg.message}
              </div>
            )}
            <button className="neu-pill text-decoration-none" onClick={loadData} title="Làm mới">
              <i className="fa-solid fa-rotate-right"></i>
            </button>
            <button className="neu-pill text-decoration-none" onClick={handleExportCSV}>
              <i className="fa-solid fa-download me-2"></i> Xuất dữ liệu
            </button>
            {selectedIds.length > 0 && (
              <button className="neu-pill text-danger text-decoration-none border-danger" onClick={handleDeleteSelected}>
                <i className="fa-regular fa-trash-can me-2"></i> Xóa đã chọn ({selectedIds.length})
              </button>
            )}
            <button 
              className="neu-pill text-decoration-none" 
              style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }}
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
            >
              <i className="fa-solid fa-plus me-2"></i> Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <ProductFilterBar 
          filters={filters} 
          setFilters={setFilters} 
          categories={categories}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />

        {/* Selection Info */}
        {selectedIds.length > 0 && (
          <div className="mb-3 text-primary fw-semibold small">
            Đã chọn {selectedIds.length} sản phẩm trên trang này.
          </div>
        )}

        {/* Product List Table */}
        <ProductList 
          products={paginatedProducts}
          loading={loading}
          categories={categories}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onToggleFeature={handleToggleFeature}
          onEdit={(prod) => { setEditingProduct(prod); setShowModal(true); }}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <ProductPagination 
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Form Modal */}
        <ProductFormModal 
          show={showModal}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          categories={categories}
          initialData={editingProduct}
          onSubmit={handleSubmitForm}
        />

        {/* Discount Modal */}
        {discountModal.show && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg neu-surface">
                <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                  <h5 className="modal-title fw-bold text-dark">Nhập giá khuyến mãi</h5>
                  <button type="button" className="btn-close" onClick={() => setDiscountModal({ show: false, product: null, discountPrice: "" })}></button>
                </div>
                <div className="modal-body px-4 py-3">
                  <p className="mb-2">
                    Sản phẩm: <strong>{discountModal.product?.name || discountModal.product?.productName}</strong>
                  </p>
                  <p className="mb-4 text-muted small">
                    Giá gốc hiện tại: <span className="text-danger fw-bold">{discountModal.product?.price?.toLocaleString("vi-VN")}đ</span>
                  </p>
                  <div>
                    <label className="form-label fw-semibold small">Nhập giá khuyến mãi mới (VNĐ) <span className="text-danger">*</span></label>
                    <input 
                      type="number" 
                      className="neu-input w-100" 
                      placeholder="Ví dụ: 299000"
                      value={discountModal.discountPrice}
                      onChange={(e) => setDiscountModal(prev => ({ ...prev, discountPrice: e.target.value }))}
                      min="0"
                    />
                    <div className="form-text text-muted mt-2" style={{ fontSize: "0.8rem" }}>Giá khuyến mãi phải nhỏ hơn giá gốc. Hệ thống sẽ tự động cập nhật lại giá gốc.</div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 px-4 pb-4 pt-0 justify-content-end">
                  <button type="button" className="neu-pill px-4" onClick={() => setDiscountModal({ show: false, product: null, discountPrice: "" })}>Hủy</button>
                  <button type="button" className="neu-pill px-4 fw-bold" style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }} onClick={handleConfirmDiscount}>
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminProductPage;
