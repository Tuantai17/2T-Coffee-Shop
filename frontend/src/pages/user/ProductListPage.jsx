import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import { addToCart } from "../../services/cartService";
import { getCategories } from "../../services/productService";

// UI Components
import ProductFilterSidebar from "./components/product-list/ProductFilterSidebar";
import ProductToolbar from "./components/product-list/ProductToolbar";
import ProductCard from "./components/product-list/ProductCard";
import ProductPagination from "./components/product-list/ProductPagination";
import { useProductFilters } from "./components/product-list/useProductFilters";
import "./components/product-list/ProductListPage.css";

function ProductListPage() {
  const {
    products,
    pageData,
    loading,
    error,
    filters,
    updateFilter,
    handleReset,
    refetch
  } = useProductFilters(12); // Default size 12 items per page

  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddToCart = async (productId) => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi mua hàng!");
      return;
    }

    try {
      await addToCart(productId, 1);
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (err) {
      console.error(err);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  const currentCategoryName = categories.find(c => c.id.toString() === filters.category)?.name || "Danh Mục Sản Phẩm";

  return (
    <UserLayout>
      <div className="mykingdom-container py-4 px-3 px-md-4">
        
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4 d-none d-md-block">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
            <li className="breadcrumb-item active text-danger fw-semibold" aria-current="page">{currentCategoryName}</li>
          </ol>
        </nav>

        {/* Mobile Filter Button */}
        <div className="d-md-none mb-3">
          <button 
            className="btn btn-outline-danger w-100 fw-bold rounded-pill"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <i className="fa-solid fa-filter me-2"></i> Lọc sản phẩm
          </button>
        </div>

        <div className="row">
          {/* Sidebar Left */}
          <div className={`col-lg-3 col-md-4 mb-4 ${!isMobileFilterOpen ? 'd-none d-md-block' : ''}`}>
            <ProductFilterSidebar 
              categories={categories}
              filters={filters}
              onFilterChange={updateFilter}
              onReset={handleReset}
            />
          </div>

          {/* Main Content Right */}
          <div className="col-lg-9 col-md-8">
            <ProductToolbar 
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalElements={pageData.totalElements}
              filters={filters}
              onFilterChange={updateFilter}
            />

            {/* Content Area */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-3 text-muted">Đang tải sản phẩm...</div>
              </div>
            ) : error ? (
              <div className="alert alert-danger rounded-4 text-center py-4">
                <i className="fa-solid fa-triangle-exclamation fs-3 mb-2"></i>
                <div>{error}</div>
                <button className="btn btn-danger mt-3 px-4 rounded-pill" onClick={refetch}>Thử lại</button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <i className="fa-solid fa-box-open fs-1 text-muted mb-3"></i>
                <h4 className="fw-bold">Không tìm thấy sản phẩm phù hợp</h4>
                <p className="text-muted mb-4">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                <button className="btn btn-outline-danger rounded-pill px-4 fw-bold" onClick={handleReset}>
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? "row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 g-md-4" : "d-flex flex-column"}>
                  {products.map(product => (
                    <div className={viewMode === 'grid' ? "col" : "w-100"} key={product.id}>
                      <ProductCard 
                        product={product} 
                        onAddToCart={handleAddToCart}
                        viewMode={viewMode}
                      />
                    </div>
                  ))}
                </div>

                <ProductPagination 
                  currentPage={pageData.page}
                  totalPages={pageData.totalPages}
                  totalElements={pageData.totalElements}
                  size={pageData.size}
                  onPageChange={(page) => updateFilter('page', page)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default ProductListPage;
