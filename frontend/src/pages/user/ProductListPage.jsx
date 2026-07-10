import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import { addToCart } from "../../services/cartService";
import { getCategories } from "../../services/productService";

// Existing hooks
import { useProductFilters } from "./components/product-list/useProductFilters";

// New UI Components
import SearchBar from "./components/product/SearchBar";
import CategorySlider from "./components/product/CategorySlider";
import FilterSidebar from "./components/product/FilterSidebar";
import ProductToolbar from "./components/product/ProductToolbar";
import ProductGrid from "./components/product/ProductGrid";
import Pagination from "./components/product/Pagination";
import QuickViewModal from "./components/product/QuickViewModal";
import RecommendationSection from "./components/product/RecommendationSection";
import FloatingMiniCart from "./components/product/FloatingMiniCart";

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
  } = useProductFilters(12); // Default size 12

  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  
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
  
  // Mock cart count
  const [cartCount, setCartCount] = useState(2);

  const handleAddToCart = async (productId, quantity = 1) => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi mua hàng!");
      return;
    }

    try {
      await addToCart(productId, quantity);
      setCartCount(prev => prev + quantity);
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (err) {
      console.error(err);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  const handleSearch = (query) => {
    updateFilter('keyword', query);
  };

  const handleCategoryChange = (categoryId) => {
    updateFilter('category', categoryId);
  };

  const handleSortChange = (sortId) => {
    // Map to backend sort if needed, for now just store it
    updateFilter('sort', sortId);
  };

  return (
    <UserLayout>
      <div style={{ backgroundColor: "#FAF8F4", minHeight: "100vh" }}>
        <div className="container py-4 px-3 px-md-4">
          
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4 d-none d-md-block">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none fw-medium hover-text-primary" style={{ color: "var(--dark-text)" }}>
                  <i className="fa-solid fa-house me-1"></i> Trang chủ
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/products" className="text-decoration-none fw-medium hover-text-primary" style={{ color: "var(--dark-text)" }}>
                  Sản phẩm
                </Link>
              </li>
              <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Tất cả đồ uống</li>
            </ol>
          </nav>

          {/* Page Title & Search */}
          <div className="row mb-2">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-2 text-uppercase" style={{ color: "var(--primary-color)", fontSize: "2rem" }}>TẤT CẢ ĐỒ UỐNG</h2>
              <p className="text-muted mb-4">Khám phá những thức uống được yêu thích nhất tại Brew Moments.</p>
            </div>
            <div className="col-lg-6">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Category Slider */}
          <CategorySlider categories={categories} activeCategory={filters.category} onCategoryChange={handleCategoryChange} />

          {/* Mobile Filter Button */}
          <div className="d-lg-none mb-4">
            <button 
              className="btn w-100 fw-bold rounded-pill shadow-sm py-3"
              style={{ backgroundColor: "var(--primary-color)", color: "white" }}
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <i className="fa-solid fa-filter me-2"></i> LỌC SẢN PHẨM {isMobileFilterOpen ? "(ĐÓNG)" : ""}
            </button>
          </div>

          <div className="row g-4">
            {/* Sidebar Left */}
            <div className={`col-lg-3 ${!isMobileFilterOpen ? 'd-none d-lg-block' : ''}`}>
              <FilterSidebar 
                filters={filters}
                onFilterChange={updateFilter}
              />
            </div>

            {/* Main Content Right */}
            <div className="col-lg-9">
              <ProductToolbar 
                totalElements={pageData.totalElements}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortValue={filters.sort || 'newest'}
                onSortChange={handleSortChange}
              />

              <ProductGrid 
                products={products}
                loading={loading}
                error={error}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onQuickView={setQuickViewProduct}
                onReset={handleReset}
              />

              {!loading && !error && products.length > 0 && (
                <Pagination 
                  currentPage={pageData.page}
                  totalPages={pageData.totalPages}
                  onPageChange={(page) => updateFilter('page', page)}
                />
              )}

              {/* Recommendation Section */}
              <div className="mt-5 pt-4 border-top">
                <RecommendationSection />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Components */}
        <FloatingMiniCart cartCount={cartCount} />
        
        <QuickViewModal 
          product={quickViewProduct} 
          isOpen={!!quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
          onAddToCart={handleAddToCart}
        />
      </div>
    </UserLayout>
  );
}

export default ProductListPage;
