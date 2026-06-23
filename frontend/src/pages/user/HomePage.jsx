import { useEffect, useState } from "react";
import { getProducts, getCategories, getBanners } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import UserLayout from "../../layouts/UserLayout";

// Child Components
import HomeBanner from "./components/home/HomeBanner";
import HomeCategorySlider from "./components/home/HomeCategorySlider";
import HomeProductSection from "./components/home/HomeProductSection";
import HomeNewsSection from "./components/home/HomeNewsSection";
import HomeFeatureInfo from "./components/home/HomeFeatureInfo";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Banners
      const bannersRes = await getBanners({ position: "HOME_HERO", activeOnly: true });
      setBanners(Array.isArray(bannersRes.data) ? bannersRes.data : []);

      // Fetch Categories
      const catRes = await getCategories();
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);

      // Fetch Hot Products (featured)
      const hotRes = await getProducts({ featured: true, sort: "featured_order" });
      const nextHot = Array.isArray(hotRes.data) ? hotRes.data : [];
      setHotProducts(nextHot.slice(0, 10)); // Lấy 10 sản phẩm hot

      // Fetch New Products (newArrival)
      const newRes = await getProducts({ newArrival: true, sort: "new_arrival_order" });
      const nextNew = Array.isArray(newRes.data) ? newRes.data : [];
      setNewProducts(nextNew.slice(0, 10)); // Lấy 10 sản phẩm mới

      // Fetch Sale Products (onSale)
      const saleRes = await getProducts({ onSale: true, sort: "on_sale_order" });
      const nextSale = Array.isArray(saleRes.data) ? saleRes.data : [];
      setSaleProducts(nextSale.slice(0, 10));

    } catch (error) {
      console.error("Lỗi lấy dữ liệu trang chủ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi mua hàng!");
      return;
    }

    try {
      await addToCart(productId, 1);
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      alert("Thêm vào giỏ hàng thất bại!");
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const heroBanner = banners[0] || null;

  return (
    <UserLayout>
      {/* Banner Quảng Cáo Lớn */}
      <HomeBanner banner={heroBanner} />

      {/* Vòng Tròn Danh Mục Nổi Bật */}
      <HomeCategorySlider categories={categories} />

      {/* Sản Phẩm Hot Nổi Bật */}
      <HomeProductSection 
        title="SẢN PHẨM HOT" 
        type="hot"
        products={hotProducts} 
        loading={loading} 
        viewAllLink="/products?type=hot" 
        onAddToCart={handleAddToCart}
        iconClass="fa-solid fa-fire-flame-simple"
      />

      {/* Sản Phẩm Mới */}
      <HomeProductSection 
        title="SẢN PHẨM MỚI" 
        type="new"
        products={newProducts} 
        loading={loading} 
        viewAllLink="/products?type=new" 
        onAddToCart={handleAddToCart}
        iconClass="fa-solid fa-star"
      />

      {/* Sản Phẩm Khuyến Mãi */}
      <HomeProductSection 
        title="SẢN PHẨM KHUYẾN MÃI" 
        type="sale"
        products={saleProducts} 
        loading={loading} 
        viewAllLink="/products?type=sale" 
        onAddToCart={handleAddToCart}
        iconClass="fa-solid fa-tag"
      />

      {/* Tin tức nổi bật */}
      <HomeNewsSection />

      {/* Cam kết của MyKingdom */}
      <HomeFeatureInfo />
    </UserLayout>
  );
}

export default HomePage;
