import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getUserProfile } from "../services/authService";
import { AUTH_SCOPES, getAuthSession } from "../utils/authStorage";
import { useState, useRef, useEffect, useCallback } from "react";
import MiniCart from "./MiniCart";
import { getCart } from "../services/cartService";
import { motion, AnimatePresence } from "framer-motion";
import loyaltyApi from "../api/loyaltyApi";
import UserNotificationDropdown from "./UserNotificationDropdown";
import { getPublicMenus } from "../services/menuService";
import { getCategories } from "../services/productService";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, email, userId } = getAuthSession(AUTH_SCOPES.USER);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [cart, setCart] = useState([]);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const miniCartHoverTimeout = useRef(null);
  const cartWrapperRef = useRef(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [navLinks, setNavLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productHovered, setProductHovered] = useState(false);
  const productHoverTimeout = useRef(null);

  const loadUserProfileData = useCallback(async () => {
    if (userId) {
      try {
        const res = await getUserProfile(userId);
        if (res.data?.userDetails?.avatarUrl) {
          setUserAvatar(res.data.userDetails.avatarUrl);
        } else {
          setUserAvatar("");
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin user cho Navbar:", error);
      }
    }
  }, [userId]);

  const loadCart = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getCart();
      setCart(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng cho Navbar:", error);
      setCart([]);
    }
  }, [token]);

  const loadLoyaltyPoints = useCallback(async () => {
    if (token) {
      try {
        const res = await loyaltyApi.getMyLoyaltyAccount();
        setLoyaltyPoints(res.data?.availablePoints || 0);
      } catch (error) {
        console.error("Lỗi lấy điểm loyalty:", error);
      }
    }
  }, [token]);

  const loadMenus = useCallback(async () => {
    try {
      const res = await getPublicMenus();
      if (res.data) {
        const activeMenus = res.data
          .filter(m => m.isActive)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setNavLinks(activeMenus);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách menu public:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      // Filter out root categories (parentId = null or missing parentId)
      // Or just take all categories. Let's take all and display them.
      if (res.data) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách danh mục:", error);
    }
  }, []);

  useEffect(() => {
    loadMenus();
    loadCategories();
    if (token) {
      loadCart();
      loadUserProfileData();
      loadLoyaltyPoints();
    }
    const handleCartUpdate = () => loadCart();
    const handleProfileUpdate = () => {
      loadUserProfileData();
      loadLoyaltyPoints();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);
    setShowMiniCart(false);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadCart, loadUserProfileData, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (cartWrapperRef.current && !cartWrapperRef.current.contains(event.target)) {
        setShowMiniCart(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout(AUTH_SCOPES.USER);
    alert("Đã đăng xuất thành công!");
    navigate("/login");
  };

  const handleCartMouseEnter = () => {
    if (miniCartHoverTimeout.current) clearTimeout(miniCartHoverTimeout.current);
    setShowMiniCart(true);
    setDropdownOpen(false);
  };

  const handleCartMouseLeave = () => {
    miniCartHoverTimeout.current = setTimeout(() => {
      setShowMiniCart(false);
    }, 200);
  };

  const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  const getIconForPath = (path) => {
    switch (path) {
      case "/": return "fa-solid fa-house";
      case "/products": return "fa-solid fa-mug-hot";
      case "/promotions": return "fa-solid fa-tags";
      case "/voucher": 
      case "/loyalty/rewards": return "fa-solid fa-ticket";
      case "/news": return "fa-regular fa-newspaper";
      case "/game": return "fa-solid fa-gamepad";
      case "/contact": return "fa-solid fa-envelope";
      default: return "fa-solid fa-link";
    }
  };

  const handleProductMouseEnter = () => {
    if (productHoverTimeout.current) clearTimeout(productHoverTimeout.current);
    setProductHovered(true);
  };

  const handleProductMouseLeave = () => {
    productHoverTimeout.current = setTimeout(() => {
      setProductHovered(false);
    }, 200);
  };

  return (
    <header 
      className={`sticky-top transition-all duration-300 ${scrolled ? 'glass-effect shadow-sm' : 'bg-white'}`}
      style={{ zIndex: 1050, height: "80px", borderBottom: scrolled ? "none" : "1px solid #f1f5f9", display: 'flex', alignItems: 'center' }}
    >
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center w-100">
          
          {/* Left: Logo & Menu */}
          <div className="d-flex align-items-center gap-4">
            <Link className="navbar-brand text-decoration-none d-flex align-items-center gap-2" to="/">
              <img src="/logo_2Tcoffee_shop.png" alt="2T Coffee Shop" style={{ height: "60px", objectFit: "contain" }} />
              <span className="fw-bold fs-4" style={{ color: "var(--primary-color)", letterSpacing: "-0.5px" }}>
                2T Coffee <span style={{ color: "var(--secondary-color)" }}>Shop</span>
              </span>
            </Link>

            <nav className="d-none d-xl-flex gap-4 mb-0 list-unstyled align-items-center">
              {navLinks.map((link, idx) => {
                const isProductLink = link.path === "/products";
                
                return (
                  <div 
                    key={idx} 
                    className="position-relative h-100 d-flex align-items-center"
                    onMouseEnter={isProductLink ? handleProductMouseEnter : undefined}
                    onMouseLeave={isProductLink ? handleProductMouseLeave : undefined}
                    style={{ padding: "10px 0" }}
                  >
                    <Link 
                      to={link.path} 
                      className={`text-decoration-none fw-semibold d-flex align-items-center gap-2 transition-all ${location.pathname === link.path ? 'text-secondary-brew' : 'text-dark hover-text-primary'}`}
                      style={{ fontSize: "0.95rem", color: location.pathname === link.path ? "var(--secondary-color)" : "var(--dark-text)" }}
                    >
                      <i className={`${link.icon || getIconForPath(link.path)} fs-6`}></i>
                      {link.name}
                      {isProductLink && <i className="fa-solid fa-chevron-down ms-1" style={{ fontSize: "0.7rem" }}></i>}
                    </Link>

                    {/* Product Categories Dropdown */}
                    {isProductLink && (
                      <AnimatePresence>
                        {productHovered && categories.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="position-absolute bg-white rounded shadow-sm border"
                            style={{ top: "100%", left: "0", minWidth: "220px", zIndex: 1060, paddingTop: "8px", paddingBottom: "8px" }}
                          >
                            <div className="d-flex flex-column">
                              {categories.slice(0, 8).map(category => (
                                <Link 
                                  key={category.id} 
                                  to={`/products?category=${category.id}`}
                                  className="text-decoration-none text-dark px-4 py-2 hover-bg-light transition-all d-flex align-items-center gap-3"
                                >
                                  {category.imageUrl && (
                                    <img src={category.imageUrl} alt={category.name} style={{ width: "24px", height: "24px", objectFit: "cover", borderRadius: "4px" }} />
                                  )}
                                  <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{category.name}</span>
                                </Link>
                              ))}
                              {categories.length > 8 && (
                                <Link to="/products" className="text-decoration-none px-4 py-2 text-primary fw-semibold text-center mt-2 border-top" style={{ fontSize: "0.85rem" }}>
                                  Xem tất cả danh mục
                                </Link>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-grow-1 px-4 d-none d-lg-block" style={{ maxWidth: "500px" }}>
            <div className="position-relative">
              <input
                type="text"
                className="form-control rounded-pill border-0 bg-light pe-5 ps-4 py-2 form-brew-control"
                placeholder="Tìm món yêu thích..."
                style={{ fontSize: "0.95rem" }}
              />
              <button className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted rounded-pill h-100 px-3">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          {/* Right: Badges & Profile */}
          <div className="d-flex align-items-center gap-3">
            {/* Mobile utilities */}
            <div className="d-flex d-md-none align-items-center gap-3 ms-auto me-3">
              <UserNotificationDropdown />
            </div>

            {/* Utility Icons (Notification, etc.) */}
            <div className="d-none d-md-flex align-items-center gap-3 me-2">
              <UserNotificationDropdown />
            </div>

            {/* Loyalty Point */}
            {token && (
              <div className="d-none d-lg-flex flex-column align-items-end me-2">
                <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: "600" }}>Loyalty</span>
                <span className="fw-bold" style={{ color: "var(--accent-green)", fontSize: "0.9rem" }}>{Number(loyaltyPoints).toLocaleString("vi-VN")} điểm</span>
              </div>
            )}

            {/* Cart */}
            <div 
              className="position-relative" 
              ref={cartWrapperRef}
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
            >
              <button 
                className="btn position-relative border-0 bg-transparent p-0 ms-2"
                onClick={() => {
                  if (window.innerWidth < 992) {
                    setShowMiniCart(!showMiniCart);
                  } else {
                    navigate("/cart");
                  }
                }}
              >
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-dark shadow-sm transition-all" style={{ width: "42px", height: "42px" }}>
                  <i className="fa-solid fa-basket-shopping fs-5"></i>
                </div>
                {totalQuantity > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm border border-white" style={{ fontSize: "0.7rem", transform: "translate(-30%, -30%)!important" }}>
                    {totalQuantity > 99 ? "99+" : totalQuantity}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showMiniCart && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MiniCart 
                      cart={cart} 
                      loadCart={loadCart} 
                      closeCart={() => setShowMiniCart(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Controls */}
            {token ? (
              <div className="dropdown ms-1" ref={dropdownRef}>
                <button 
                  className="btn d-flex align-items-center gap-2 border-0 p-0 shadow-none bg-transparent" 
                  type="button" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="d-flex flex-column align-items-end d-none d-md-flex">
                    <span className="text-muted" style={{ fontSize: "0.7rem" }}>Xin chào,</span>
                    <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '100px', fontSize: "0.9rem" }}>
                      {email ? email.split('@')[0] : "Tài khoản"}
                    </span>
                  </div>
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt="User Avatar" 
                      className="rounded-circle shadow-sm" 
                      style={{ width: "42px", height: "42px", objectFit: "cover", border: "2px solid #fff" }} 
                    />
                  ) : (
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: "42px", height: "42px" }}>
                      <i className="fa-solid fa-user fs-5"></i>
                    </div>
                  )}
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="dropdown-menu dropdown-menu-end border-0 mt-3 show" 
                      style={{ padding: '8px', minWidth: '220px', borderRadius: '16px', right: 0, top: '100%', zIndex: 1060, boxShadow: 'var(--shadow-soft)' }}
                    >
                      <li>
                        <Link to="/profile" className="dropdown-item py-2 fw-semibold rounded d-flex align-items-center gap-2 text-dark" onClick={() => setDropdownOpen(false)}>
                          <i className="fa-regular fa-user text-muted" style={{ width: '20px' }}></i> Tài khoản
                        </Link>
                      </li>
                      <li>
                        <Link to="/profile/orders" className="dropdown-item py-2 fw-semibold rounded d-flex align-items-center gap-2 text-dark" onClick={() => setDropdownOpen(false)}>
                          <i className="fa-solid fa-clock-rotate-left text-muted" style={{ width: '20px' }}></i> Lịch sử đơn hàng
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider my-1 border-light" /></li>
                      <li>
                        <button className="dropdown-item py-2 fw-semibold text-danger rounded d-flex align-items-center gap-2" onClick={() => { setDropdownOpen(false); handleLogout(); }}>
                          <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: '20px' }}></i> Đăng xuất
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn btn-brew-primary ms-2 rounded-pill px-4">
                Đăng nhập
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
