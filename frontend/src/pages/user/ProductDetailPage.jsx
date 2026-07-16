import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { addToCart } from "../../services/cartService";
import { getCategories, getProductById, getProductBySlug, getProducts, getToppings, getOptionGroups } from "../../services/productService";
import UserLayout from "../../layouts/UserLayout";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import { applyImageFallback, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../../utils/imageFallback";

// New Components
import Gallery from "./components/product-detail/Gallery";
import ProductHeader from "./components/product-detail/ProductHeader";
import SizeSelector from "./components/product-detail/SizeSelector";
import TemperatureSelector from "./components/product-detail/TemperatureSelector";
import IceSugarSelector from "./components/product-detail/IceSugarSelector";
import ToppingSelector from "./components/product-detail/ToppingSelector";
import QuantityNote from "./components/product-detail/QuantityNote";
import ActionButtons from "./components/product-detail/ActionButtons";
import ServiceInfo from "./components/product-detail/ServiceInfo";
import DescriptionTabs from "./components/product-detail/DescriptionTabs";
import ReviewSection from "./components/product-detail/ReviewSection";
import VoucherCard from "./components/product-detail/VoucherCard";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [globalToppings, setGlobalToppings] = useState([]);
  const [globalOptionGroups, setGlobalOptionGroups] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedTemp, setSelectedTemp] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const isSlug = isNaN(id);
      const res = isSlug ? await getProductBySlug(id) : await getProductById(id);
      const prod = res.data;
      setProduct(prod);
      
      // Auto-select first options if available
      if (prod.variants && prod.variants.length > 0) {
        setSelectedSize(prod.variants[0].id || 'var-0');
      }

      const [catRes, topRes, optRes] = await Promise.all([
        getCategories(),
        getToppings(),
        getOptionGroups()
      ]);
      setCategories(catRes.data);
      const allToppings = topRes.data || [];
      const allOptionGroups = optRes.data || [];
      setGlobalToppings(allToppings);
      setGlobalOptionGroups(allOptionGroups);

      const tempGroup = allOptionGroups.find(g => g.name.toLowerCase().includes('nhiệt'));
      if (tempGroup?.options?.length > 0) setSelectedTemp(tempGroup.options[0].id);
      else setSelectedTemp('cold'); // default to 'cold' for backwards compatibility if temp group doesn't exist but ice group does

      const iceGroup = allOptionGroups.find(g => g.name.toLowerCase().includes('đá') || g.name.toLowerCase().includes('ice'));
      if (iceGroup?.options?.length > 0) setSelectedIce(iceGroup.options[0].id);

      const sugarGroup = allOptionGroups.find(g => g.name.toLowerCase().includes('ngọt') || g.name.toLowerCase().includes('sugar') || g.name.toLowerCase().includes('đường'));
      if (sugarGroup?.options?.length > 0) setSelectedSugar(sugarGroup.options[0].id);

      const relRes = await getProducts({ category: prod.categoryId, sort: "newest" });
      setRelatedProducts((relRes.data || []).filter(item => item.id !== prod.id).slice(0, 4));
    } catch (error) {
      console.error(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  const getCategoryName = (categoryId) => {
    const found = categories.find((cat) => String(cat.id) === String(categoryId));
    return found ? found.name : 'Đồ uống';
  };

  const handleToppingChange = (toppingId, newQuantity) => {
    setSelectedToppings(prev => {
      const others = prev.filter(id => id !== toppingId);
      const added = Array(newQuantity).fill(toppingId);
      return [...others, ...added];
    });
  };

  const handleAddToCart = async () => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      alert("Vui lòng đăng nhập trước!");
      navigate("/login");
      return;
    }

    try {
      // Collect selected variant ID
      let variantId = null;
      if (selectedSize && product.variants) {
        const variant = product.variants.find(v => v.id === selectedSize || `var-${product.variants.indexOf(v)}` === selectedSize);
        if (variant && typeof variant.id === 'number') variantId = variant.id;
      }

      const isProductDrink = product ? !getCategoryName(product.categoryId).toLowerCase().includes('bánh') : true;

      // Collect all selected option IDs (temp, ice, sugar)
      const optionIds = [];
      if (isProductDrink) {
        if (selectedTemp && !isNaN(Number(selectedTemp))) optionIds.push(Number(selectedTemp));
        if (selectedIce && !isNaN(Number(selectedIce))) optionIds.push(Number(selectedIce));
        if (selectedSugar && !isNaN(Number(selectedSugar))) optionIds.push(Number(selectedSugar));
      }

      // Collect selected topping IDs
      const toppingIds = isProductDrink ? selectedToppings
        .filter(id => !isNaN(Number(id)))
        .map(id => Number(id)) : [];

      await addToCart(product.id, quantity, {
        variantId,
        optionIds,
        toppingIds,
        note: note || null,
      });
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      console.error(error);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="container mt-4 pt-5 pb-5 text-center" style={{ minHeight: "70vh" }}>
          <div className="spinner-border text-danger mx-auto mb-3" style={{ width: "3rem", height: "3rem" }}></div>
          <h5 className="text-muted">Đang pha chế trang chi tiết...</h5>
        </div>
      </UserLayout>
    );
  }

  if (!product) {
    return (
      <UserLayout>
        <div className="container mt-5 pt-5 pb-5 text-center">
          <i className="fa-solid fa-mug-hot text-muted display-1 mb-4"></i>
          <h3 className="fw-bold">Không tìm thấy sản phẩm!</h3>
          <p className="text-muted">Món nước này có thể đã hết hoặc không tồn tại.</p>
          <Link to="/products" className="btn btn-danger rounded-pill px-4 py-2 mt-3 fw-bold">Về trang sản phẩm</Link>
        </div>
      </UserLayout>
    );
  }

  // Helper to safely sort options
  const sortOptions = (options) => [...options].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const isDrink = product ? !getCategoryName(product.categoryId).toLowerCase().includes('bánh') : true;

  const apiSizes = product.variants ? product.variants.map((v, index) => ({ id: v.id || `var-${index}`, name: v.sizeName, price: v.priceAdjustment })) : [];

  const tempGroup = globalOptionGroups.find(g => g.name.toLowerCase().includes('nhiệt'));
  const apiTemps = tempGroup ? sortOptions(tempGroup.options).map(o => ({ id: o.id, name: o.name })) : [];

  const iceGroup = globalOptionGroups.find(g => g.name.toLowerCase().includes('đá') || g.name.toLowerCase().includes('ice'));
  const apiIceLevels = iceGroup ? sortOptions(iceGroup.options).map(o => ({ id: o.id, name: o.name })) : [];

  const sugarGroup = globalOptionGroups.find(g => g.name.toLowerCase().includes('ngọt') || g.name.toLowerCase().includes('sugar') || g.name.toLowerCase().includes('đường'));
  const apiSugarLevels = sugarGroup ? sortOptions(sugarGroup.options).map(o => ({ id: o.id, name: o.name })) : [];

  const apiToppings = sortOptions(globalToppings);

  // Calculate Realtime Price
  const basePrice = product.price || 0;
  const sizePrice = apiSizes.find(s => s.id === selectedSize)?.price || 0;
  const toppingsPrice = selectedToppings.reduce((total, tId) => {
    const t = apiToppings.find(t => t.id === tId);
    return total + (t ? t.price : 0);
  }, 0);
  const loyaltyPoints = Math.floor((basePrice + sizePrice + toppingsPrice) * quantity * 0.001);

  return (
    <UserLayout>
      <div style={{ backgroundColor: "#FFFFFF", minHeight: "100vh", paddingBottom: "80px" }}>
        <div className="container py-4 px-3 px-md-4">
          
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4 d-none d-md-block">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none fw-medium text-dark"><i className="fa-solid fa-house me-1"></i> Trang chủ</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/products" className="text-decoration-none fw-medium text-dark">Sản phẩm</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/products?category=${product.categoryId}`} className="text-decoration-none fw-medium text-dark">{getCategoryName(product.categoryId)}</Link>
              </li>
              <li className="breadcrumb-item active fw-bold text-danger" aria-current="page">{product.name}</li>
            </ol>
          </nav>

          <div className="row g-4 g-lg-5 mb-5">
            <div className="col-lg-5">
              <div className="position-sticky" style={{ top: "100px" }}>
                <Gallery product={product} />
                <div className="mt-3 px-3 px-md-0 d-flex justify-content-center">
                  <QuantityNote quantity={quantity} maxQuantity={product.quantity || 99} onQuantityChange={setQuantity} note={note} onNoteChange={setNote} />
                </div>
              </div>
            </div>

            {/* Right: Product Info & Form */}
            <div className="col-lg-7">
              <div className="p-4 p-md-5">
                
                <ProductHeader product={product} getCategoryName={getCategoryName} />

                {/* Form Options */}
                <div className="mt-4">
                  {apiSizes.length > 0 && (
                    <SizeSelector sizes={apiSizes} selectedSize={selectedSize} onSizeChange={setSelectedSize} />
                  )}
                  
                  {isDrink && (
                    <>
                      {apiTemps.length > 0 && (
                        <TemperatureSelector levels={apiTemps} selectedTemp={selectedTemp} onTempChange={setSelectedTemp} />
                      )}
                      
                      {(!apiTemps.length || (apiTemps.length > 0 && apiTemps.find(t => t.id === selectedTemp)?.name?.toLowerCase().includes('lạnh'))) && apiIceLevels.length > 0 && (
                        <IceSugarSelector type="ice" title={<>3. Độ đá <span className="text-danger">*</span></>} levels={apiIceLevels} selectedLevel={selectedIce} onLevelChange={setSelectedIce} />
                      )}
                      
                      {apiSugarLevels.length > 0 && (
                        <IceSugarSelector type="sugar" title={<>4. Độ ngọt <span className="text-danger">*</span></>} levels={apiSugarLevels} selectedLevel={selectedSugar} onLevelChange={setSelectedSugar} />
                      )}
                      
                      {apiToppings.length > 0 && (
                        <ToppingSelector toppings={apiToppings} selectedToppings={selectedToppings} onToppingChange={handleToppingChange} />
                      )}
                    </>
                  )}
                  
                  <div className="mt-4 pt-4 border-top">
                    <ActionButtons 
                      onAddToCart={handleAddToCart} 
                      onBuyNow={() => { handleAddToCart(); setTimeout(() => navigate('/cart'), 500); }} 
                      isOutOfStock={product.quantity <= 0} 
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="py-4 mb-5 border-top border-bottom">
            <ServiceInfo />
          </div>

          <div className="row g-4 g-lg-5">
            {/* Left Column Bottom */}
            <div className="col-lg-8">
              <DescriptionTabs product={product} />
              
              {/* Related Products inline */}
              {relatedProducts.length > 0 && (
                <div className="mb-4 mt-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-uppercase mb-0">SẢN PHẨM LIÊN QUAN</h5>
                    <Link to="/products" className="btn btn-link text-danger text-decoration-none small fw-bold">Xem tất cả <i className="fa-solid fa-chevron-right ms-1"></i></Link>
                  </div>
                  <div className="d-flex gap-4 overflow-auto hide-scrollbar pb-3">
                    {relatedProducts.map(item => (
                      <Link to={`/products/${item.id}`} key={item.id} className="text-decoration-none text-dark border rounded-4 p-3 transition-all hover-scale" style={{ width: "180px", minWidth: "180px" }}>
                        <div className="rounded-3 overflow-hidden mb-3" style={{ aspectRatio: "1/1" }}>
                          <img src={resolveImageUrl(item.imageUrl)} className="w-100 h-100 object-fit-cover" alt={item.name} onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)} />
                        </div>
                        <h6 className="fw-bold mb-2 text-truncate" style={{ fontSize: "15px" }}>{item.name}</h6>
                        <div className="text-danger fw-bold">{item.price?.toLocaleString()}đ</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Bottom (Sticky Sidebar) */}
            <div className="col-lg-4">
              <div className="position-sticky" style={{ top: "100px" }}>
                <VoucherCard />
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .hover-scale:hover { transform: scale(1.05); }
      `}</style>
    </UserLayout>
  );
}

export default ProductDetailPage;
