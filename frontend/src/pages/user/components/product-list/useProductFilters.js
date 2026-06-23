import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPagedProducts } from '../../../../services/productService';

export function useProductFilters(defaultSize = 12) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pageData, setPageData] = useState({
    page: 0,
    size: defaultSize,
    totalElements: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getInitialFilters = useCallback(() => {
    return {
      keyword: searchParams.get("keyword") || "",
      category: searchParams.get("category") || "",
      brand: searchParams.get("brand") || "",
      badge: searchParams.get("badge") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      ageFrom: searchParams.get("ageFrom") || "",
      ageTo: searchParams.get("ageTo") || "",
      sort: searchParams.get("sort") || "newest",
      page: parseInt(searchParams.get("page") || "0", 10),
      size: parseInt(searchParams.get("size") || String(defaultSize), 10),
      onSale: searchParams.get("onSale") === "true" || searchParams.get("type") === "sale",
      newArrival: searchParams.get("newArrival") === "true" || searchParams.get("type") === "new",
      featured: searchParams.get("featured") === "true" || searchParams.get("type") === "hot" || searchParams.get("type") === "best-seller",
    };
  }, [searchParams, defaultSize]);

  const [filters, setFilters] = useState(getInitialFilters());

  // Sync state filter from URL
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [getInitialFilters]);

  const fetchProducts = useCallback(async (currentFilters) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] !== "" && currentFilters[key] !== false && currentFilters[key] != null) {
          params[key] = currentFilters[key];
        }
      });

      const res = await getPagedProducts(params);
      
      // Expected backend returns a Page object: { content: [], number: 0, size: 12, totalElements: 654, totalPages: 55 }
      const data = res.data;
      if (data && Array.isArray(data.content)) {
        setProducts(data.content);
        setPageData({
          page: data.number || 0,
          size: data.size || defaultSize,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0
        });
      } else if (Array.isArray(data)) {
        // Fallback in case endpoint still returns array directly (should not happen with /products/paged)
        setProducts(data);
        setPageData({
          page: 0,
          size: data.length,
          totalElements: data.length,
          totalPages: 1
        });
      } else {
        setProducts([]);
        setPageData({ page: 0, size: defaultSize, totalElements: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [defaultSize]);

  // When filters state change locally, we update the URL
  // which will trigger the useEffect above, but we also can fetch immediately to save a cycle
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key !== 'page') {
      newFilters.page = 0; // Reset page on filter change
    }
    
    // Build new search params
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k] !== "" && newFilters[k] !== false && newFilters[k] != null) {
        // Special mapping if 'type' was used before, we just use precise booleans now
        if (k !== 'type') {
          params.set(k, newFilters[k]);
        }
      }
    });
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  return {
    products,
    pageData,
    loading,
    error,
    filters,
    updateFilter,
    handleReset,
    refetch: () => fetchProducts(filters)
  };
}
