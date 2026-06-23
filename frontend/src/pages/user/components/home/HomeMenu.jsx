import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicMenus } from "../../../../services/menuService";
import { getPagedProducts, getCategories } from "../../../../services/productService";

function HomeMenu() {
  const [menus, setMenus] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await getPublicMenus();
        setMenus(res.data || []);
      } catch (error) {
        console.error("Lỗi lấy menu public:", error);
      }
    };
    
    const fetchProducts = async () => {
      try {
        const res = await getPagedProducts({ size: 2, sort: 'id,desc' });
        if (res.data && res.data.content) {
          setFeaturedProducts(res.data.content);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm nổi bật:", error);
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    
    fetchMenus();
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div style={{ backgroundColor: "#ce1f28" }} className="border-top border-danger pb-2 pt-1 shadow-sm">
      <div className="container position-relative">
        <div className="d-flex justify-content-center justify-content-lg-between align-items-center flex-wrap gap-2 gap-lg-0 mt-1 pb-2">
          {menus.map((menu) => {
            let displayChildren = menu.children || [];
            
            // Tự động gán Danh mục (Categories) vào Menu "SẢN PHẨM"
            if (menu.path === '/products' || (menu.name && menu.name.toUpperCase() === 'SẢN PHẨM')) {
              if (categories && categories.length > 0) {
                const parentMap = new Map();
                const roots = [];
                
                categories.forEach(cat => {
                  parentMap.set(String(cat.id), { 
                    id: 'cat_' + cat.id, 
                    name: cat.name, 
                    path: `/products?category=${cat.slug}`, 
                    icon: cat.imageUrl, 
                    children: [] 
                  });
                });
                
                categories.forEach(cat => {
                  const node = parentMap.get(String(cat.id));
                  if (cat.parentId && parentMap.has(String(cat.parentId))) {
                    parentMap.get(String(cat.parentId)).children.push(node);
                  } else {
                    roots.push(node);
                  }
                });
                displayChildren = roots;
              }
            }

            const hasChildren = displayChildren && displayChildren.length > 0;
            const isMegaMenu = hasChildren;

            return (
              <div key={menu.id} className={`dropdown home-menu-item ${isMegaMenu ? 'position-static' : 'position-relative'}`}>
                <Link 
                  to={menu.path} 
                  className="text-white text-decoration-none fw-bold d-flex align-items-center gap-2 px-2 hover-opacity h-100" 
                  style={{ fontSize: "14px", transition: "opacity 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.8'} 
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  {menu.icon && <img src={menu.icon} width="20" height="20" alt={menu.name} style={{ objectFit: 'contain' }} />}
                  <span className="text-uppercase">{menu.name}</span>
                  {hasChildren && <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>}
                </Link>
                
                {hasChildren && (
                  isMegaMenu ? (
                    <div className="dropdown-menu mega-menu shadow-lg border-0 mt-2 rounded-4 p-0 mx-auto" style={{ width: '600px', left: '50%', transform: 'translateX(-50%)' }}>
                      <div className="row g-0 h-100">
                        {/* Cột trái: Menu cấp 2 */}
                        <div className="col-5 bg-white border-end p-3 rounded-start-4">
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-2 mega-menu-left">
                            {displayChildren.map((child, index) => (
                              <li key={child.id} className="mega-menu-left-item">
                                <Link 
                                  to={child.path} 
                                  className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-2 rounded-pill fw-semibold ${index === 0 ? 'active' : ''}`}
                                >
                                  {child.icon && <img src={child.icon} width="24" height="24" alt={child.name} style={{ objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                                  {child.name}
                                </Link>
                                
                                {/* Nội dung bên phải (Menu cấp 3) sẽ hiển thị khi hover */}
                                <div className="mega-menu-right-content position-absolute top-0 bottom-0 bg-white rounded-end-4 p-4 shadow-sm" style={{ left: "41.666667%", right: 0, overflowY: "auto" }}>
                                  <div className="row h-100">
                                    <div className="col-12">
                                      <h6 className="text-danger fw-bold mb-4 text-uppercase border-bottom pb-2">{child.name}</h6>
                                      {child.children && child.children.length > 0 ? (
                                        <ul className="list-unstyled d-flex flex-column gap-3">
                                          {child.children.map(subChild => (
                                            <li key={subChild.id}>
                                              <Link to={subChild.path} className="text-decoration-none text-dark hover-text-danger fw-medium d-flex align-items-center gap-2">
                                                <i className="fa-solid fa-caret-right text-muted small"></i>
                                                {subChild.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-muted small fst-italic">Đang cập nhật danh mục...</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ul className="dropdown-menu shadow border-0 mt-2 rounded-3">
                      {displayChildren.map(child => (
                        <li key={child.id}>
                          <Link className="dropdown-item py-2 fw-medium" to={child.path}>
                            {child.icon && <img src={child.icon} width="16" height="16" alt={child.name} className="me-2" style={{ objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HomeMenu;
