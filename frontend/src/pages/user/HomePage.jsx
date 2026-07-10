import { useEffect, useState } from "react";
import { getProducts, getCategories, getBanners } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import UserLayout from "../../layouts/UserLayout";

// Child Components
import HeroSlider from "./components/home/HeroSlider";
import QuickOrder from "./components/home/QuickOrder";
import HomeCategorySlider from "./components/home/HomeCategorySlider";
import HomeProductSection from "./components/home/HomeProductSection";
import ComboBanner from "./components/home/ComboBanner";
import FlashSale from "./components/home/FlashSale";
import LoyaltySummary from "./components/home/LoyaltySummary";
import DailyCheckInSummary from "./components/home/DailyCheckInSummary";
import MiniGameBanner from "./components/home/MiniGameBanner";
import VoucherSummary from "./components/home/VoucherSummary";
import HomeNewsSection from "./components/home/HomeNewsSection";
import HomeFeatureInfo from "./components/home/HomeFeatureInfo";
import AppDownload from "./components/home/AppDownload";
import FloatingButtons from "./components/home/FloatingButtons";

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
      setHotProducts(nextHot.slice(0, 10));

      // Fetch New Products (newArrival)
      const newRes = await getProducts({ newArrival: true, sort: "new_arrival_order" });
      const nextNew = Array.isArray(newRes.data) ? newRes.data : [];
      setNewProducts(nextNew.slice(0, 10));

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
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      alert("Thêm vào giỏ hàng thất bại!");
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, []);

  return (
    <UserLayout>
      <HeroSlider banners={banners} />
      <QuickOrder />
      <HomeCategorySlider categories={categories} />
      
      <HomeProductSection 
        title="SẢN PHẨM NỔI BẬT" 
        type="hot"
        products={hotProducts} 
        loading={loading} 
        viewAllLink="/products?type=hot" 
        onAddToCart={handleAddToCart}
      />
      
      <HomeProductSection 
        title="SẢN PHẨM BÁN CHẠY" 
        type="sale"
        products={saleProducts} 
        loading={loading} 
        viewAllLink="/products?type=sale" 
        onAddToCart={handleAddToCart}
      />
      
      <HomeProductSection 
        title="SẢN PHẨM MỚI" 
        type="new"
        products={newProducts} 
        loading={loading} 
        viewAllLink="/products?type=new" 
        onAddToCart={handleAddToCart}
      />

      <ComboBanner />
      <FlashSale />
      <LoyaltySummary />
      <DailyCheckInSummary />
      <MiniGameBanner />
      <VoucherSummary />
      <HomeNewsSection />
      <HomeFeatureInfo />
      <AppDownload />
      <FloatingButtons />
    </UserLayout>
  );
}

export default HomePage;
