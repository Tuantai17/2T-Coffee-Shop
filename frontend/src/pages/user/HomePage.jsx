import { useEffect, useState } from "react";
import { getProducts, getCategories, getBanners, getPagedProducts, getToppings } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { getPublicPosts } from "../../services/newsPublicService";
import { resolveImageUrl } from "../../utils/imageFallback";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import UserLayout from "../../layouts/UserLayout";

// Child Components
import HeroSlider from "./components/home/HeroSlider";
import QuickOrder from "./components/home/QuickOrder";
import HomeCategorySlider from "./components/home/HomeCategorySlider";
import HomeProductSection from "./components/home/HomeProductSection";
import HomeToppingSection from "./components/home/HomeToppingSection";
import LoyaltySummary from "./components/home/LoyaltySummary";
import DailyCheckInSummary from "./components/home/DailyCheckInSummary";
import MiniGameBanner from "./components/home/MiniGameBanner";
import HomeNewsSection from "./components/home/HomeNewsSection";
import HomeFeatureInfo from "./components/home/HomeFeatureInfo";
import FloatingButtons from "./components/home/FloatingButtons";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Banners — chỉ HOME_HERO, active; backend đã sort sortOrder ASC
      const bannersRes = await getBanners({ position: "HOME_HERO", activeOnly: true });
      const bannerList = Array.isArray(bannersRes.data) ? bannersRes.data : [];
      // Phòng thủ: lọc active + sort lại theo sortOrder (HeroSlider cũng sort)
      const ordered = bannerList
        .filter((b) => b && b.active !== false && (b.imageUrl || b.imgUrl || b.desktopImageUrl || b.bannerUrl))
        .sort((a, b) => {
          const oa = Number(a.sortOrder ?? a.displayOrder ?? 0);
          const ob = Number(b.sortOrder ?? b.displayOrder ?? 0);
          if (oa !== ob) return oa - ob;
          return Number(a.id ?? 0) - Number(b.id ?? 0);
        });
      setBanners(ordered);

      // Fetch Categories
      const catRes = await getCategories();
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);

      // Fetch Best Sellers (featured=true, sắp xếp theo soldCount giảm dần)
      const hotRes = await getProducts({ featured: true });
      const hotProducts = Array.isArray(hotRes.data) ? hotRes.data : [];
      const sortedBySold = [...hotProducts].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      setBestSellers(sortedBySold);

      // Fetch New Products (newArrival=true, sắp xếp theo ngày mới nhất)
      const newRes = await getProducts({ newArrival: true, sort: "newest" });
      const nextNew = Array.isArray(newRes.data) ? newRes.data : [];
      setNewProducts(nextNew);

      // Fetch Toppings
      try {
        const toppingRes = await getToppings();
        const toppingList = Array.isArray(toppingRes.data) ? toppingRes.data : [];
        setToppings(toppingList);
      } catch (err) {
        console.error("Lỗi lấy topping:", err);
      }

      // Fetch Latest News
      try {
        const newsRes = await getPublicPosts({ page: 0, size: 3 });
        if (newsRes && newsRes.data && newsRes.data.content) {
            const formattedNews = newsRes.data.content.map(p => ({
                id: p.slug,
                title: p.title,
                img: resolveImageUrl(p.thumbnailUrl),
                date: new Date(p.publishedAt || p.createdAt).toLocaleDateString('vi-VN'),
                cat: p.categoryName || 'Tin tức',
            }));
            setLatestNews(formattedNews);
        }
      } catch (err) {
        console.error("Lỗi lấy tin tức trang chủ:", err);
      }

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
        title="SẢN PHẨM BÁN CHẠY NHẤT" 
        type="hot"
        products={bestSellers} 
        loading={loading} 
        viewAllLink="/products?type=hot" 
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
      
      <HomeToppingSection 
        toppings={toppings}
        loading={loading}
      />

      <LoyaltySummary />
      <DailyCheckInSummary />
      <MiniGameBanner />
      <HomeNewsSection news={latestNews} />
      <HomeFeatureInfo />
      <FloatingButtons />
    </UserLayout>
  );
}

export default HomePage;

