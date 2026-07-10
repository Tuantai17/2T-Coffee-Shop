import React, { useState, useEffect } from "react";
import uploadService from "../../../services/uploadService";

function ProductFormModal({ show, onClose, categories, toppings = [], optionGroups = [], initialData, onSubmit, products = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    categoryId: "",
    status: "ACTIVE",
    price: "",
    originalPrice: "",
    quantity: "",
    imageUrl: "",
    imageUrls: "",
    description: "",
    featured: false,
    newArrival: false,
    onSale: false,
    onSaleOrder: 0,
    newArrivalOrder: 0,
    featuredOrder: 0,
    variants: [],
    optionGroups: [],
    toppings: [],
    showUrlInput: false,
  });

  const [previewMainImage, setPreviewMainImage] = useState("");
  const [previewGallery, setPreviewGallery] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (show && initialData) {
      setFormData({
        name: initialData.name || initialData.productName || "",
        slug: initialData.slug || "",
        sku: initialData.sku || "",
        categoryId: initialData.categoryId || initialData.category || "",
        status: initialData.status || "ACTIVE",
        price: initialData.price || "",
        originalPrice: initialData.originalPrice || "",
        quantity: initialData.quantity || initialData.availability || "",
        imageUrl: initialData.imageUrl || "",
        imageUrls: Array.isArray(initialData.imageUrls) ? initialData.imageUrls.join(", ") : initialData.imageUrls || "",
        description: initialData.description || initialData.discription || "",
        featured: Boolean(initialData.featured),
        newArrival: Boolean(initialData.newArrival),
        onSale: Boolean(initialData.onSale),
        onSaleOrder: initialData.onSaleOrder || 0,
        newArrivalOrder: initialData.newArrivalOrder || 0,
        featuredOrder: initialData.featuredOrder || 0,
        variants: initialData.variants || [],
        optionGroups: initialData.optionGroups || [],
        toppings: initialData.toppings || [],
        showUrlInput: false,
      });
      setPreviewMainImage(initialData.imageUrl || "");
      if (initialData.imageUrls && Array.isArray(initialData.imageUrls)) {
        setPreviewGallery(initialData.imageUrls);
      } else if (typeof initialData.imageUrls === 'string' && initialData.imageUrls.trim()) {
        setPreviewGallery(initialData.imageUrls.split(",").map(url => url.trim()).filter(Boolean));
      } else {
        setPreviewGallery([]);
      }
    } else if (show) {
      // Reset form
      setFormData({
        name: "", slug: "", sku: "", categoryId: "", status: "ACTIVE",
        price: "", originalPrice: "", quantity: "", imageUrl: "", imageUrls: "",
        description: "", featured: false, newArrival: false, onSale: false, onSaleOrder: 0, newArrivalOrder: 0, featuredOrder: 0,
        variants: [], optionGroups: [], toppings: [], showUrlInput: false,
      });
      setPreviewMainImage("");
      setPreviewGallery([]);
    }
  }, [show, initialData]);

  const generateSlug = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
      .replace(/đ/gi, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };
      
      // Auto-generate slug from name
      if (name === "name") {
        newData.slug = generateSlug(value);
      }

      // Auto-generate SKU from category if creating new
      if (name === "categoryId" && !initialData) {
        const selectedCategory = categories.find(c => String(c.id) === String(value));
        if (selectedCategory) {
          const prefix = generateSlug(selectedCategory.name)
            .split('-')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 3) || 'PRD'; // Fallback to PRD if empty
            
          // Find all products with this category
          const productsInCategory = products.filter(p => String(p.categoryId || p.category) === String(value));
          
          let maxNumber = 0;
          productsInCategory.forEach(p => {
             if (p.sku && p.sku.startsWith(`${prefix}-`)) {
                 const numPart = p.sku.substring(prefix.length + 1);
                 const num = parseInt(numPart, 10);
                 if (!isNaN(num) && num > maxNumber) {
                     maxNumber = num;
                 }
             }
          });
          
          const nextNumber = maxNumber + 1;
          const formattedNumber = nextNumber.toString().padStart(2, '0'); // Minimum 2 digits
          newData.sku = `${prefix}-${formattedNumber}`;
        }
      }

      return newData;
    });
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewMainImage(localUrl);
        
        // Upload to Cloudinary via backend
        const targetFolder = formData.sku ? `products/${formData.sku}` : `products/temp_${Date.now()}`;
        const cloudinaryUrl = await uploadService.uploadImage(file, targetFolder);
        
        // Update form with actual Cloudinary URL
        setFormData(prev => ({ ...prev, imageUrl: cloudinaryUrl }));
        setPreviewMainImage(cloudinaryUrl); // Update preview with actual URL
      } catch (error) {
        alert("Có lỗi xảy ra khi tải ảnh lên Cloudinary!");
        setPreviewMainImage("");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        setIsUploading(true);
        const newLocalUrls = files.map(file => URL.createObjectURL(file));
        setPreviewGallery(prev => [...prev, ...newLocalUrls]);
        
        const uploadedUrls = [];
        const targetFolder = formData.sku ? `products/${formData.sku}` : `products/temp_${Date.now()}`;
        for (const file of files) {
          const url = await uploadService.uploadImage(file, targetFolder);
          uploadedUrls.push(url);
        }
        
        setPreviewGallery(prev => {
          // Replace local previews with actual uploaded URLs
          const updated = [...prev];
          updated.splice(updated.length - files.length, files.length, ...uploadedUrls);
          return updated;
        });
        
        setFormData(prev => {
          const currentUrls = prev.imageUrls ? prev.imageUrls.split(",").map(s=>s.trim()).filter(Boolean) : [];
          return { ...prev, imageUrls: [...currentUrls, ...uploadedUrls].join(", ") };
        });
      } catch (error) {
        alert("Có lỗi xảy ra khi tải gallery ảnh lên Cloudinary!");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    setPreviewGallery(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setFormData(prev => {
      const currentUrls = prev.imageUrls ? prev.imageUrls.split(",").map(s=>s.trim()).filter(Boolean) : [];
      const updatedUrls = currentUrls.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, imageUrls: updatedUrls.join(", ") };
    });
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { sizeName: "", priceAdjustment: 0 }]
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleToggleTopping = (topping) => {
    setFormData(prev => {
      const exists = prev.toppings.find(t => t.id === topping.id);
      if (exists) {
        return { ...prev, toppings: prev.toppings.filter(t => t.id !== topping.id) };
      } else {
        return { ...prev, toppings: [...prev.toppings, topping] };
      }
    });
  };

  const handleToggleOptionGroup = (group) => {
    setFormData(prev => {
      const exists = prev.optionGroups.find(g => g.id === group.id);
      if (exists) {
        return { ...prev, optionGroups: prev.optionGroups.filter(g => g.id !== group.id) };
      } else {
        return { ...prev, optionGroups: [...prev.optionGroups, group] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 rounded-0 shadow-lg bg-white">
          <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
            <h5 className="modal-title fw-bold text-dark">{initialData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3" style={{ backgroundColor: "var(--admin-bg)" }}>
            <form onSubmit={handleSubmit} id="productForm">
              
              {/* Group 1: Thông tin cơ bản */}
              <div className="card rounded-0 border-light shadow-sm bg-white p-4 mb-4">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Thông tin cơ bản</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Tên sản phẩm <span className="text-danger">*</span></label>
                    <input type="text" className="form-control rounded-0 w-100" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">SKU <span className="text-danger">*</span></label>
                    <input type="text" className="form-control rounded-0 w-100" name="sku" value={formData.sku} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Slug <span className="text-danger">*</span></label>
                    <input type="text" className="form-control rounded-0 w-100" name="slug" value={formData.slug} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Danh mục <span className="text-danger">*</span></label>
                    <select className="form-control rounded-0 w-100 form-select" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Trạng thái <span className="text-danger">*</span></label>
                    <select className="form-control rounded-0 w-100 form-select" name="status" value={formData.status} onChange={handleChange} required>
                      <option value="ACTIVE">Đang bán (Active)</option>
                      <option value="INACTIVE">Ẩn (Inactive)</option>
                      <option value="OUT_OF_STOCK">Hết hàng (Out of stock)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 2: Giá và tồn kho */}
              <div className="card rounded-0 border-light shadow-sm bg-white p-4 mb-4">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Giá & Tồn kho</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Giá bán (VNĐ) <span className="text-danger">*</span></label>
                    <input type="text" className="form-control rounded-0 w-100 text-danger fw-bold" name="price" value={formData.price} onChange={(e) => {const val = e.target.value.replace(/\D/g, ''); setFormData(p => ({...p, price: val}))}} required placeholder="Ví dụ: 50000" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Giá gốc (VNĐ)</label>
                    <input type="text" className="form-control rounded-0 w-100" name="originalPrice" value={formData.originalPrice} onChange={(e) => {const val = e.target.value.replace(/\D/g, ''); setFormData(p => ({...p, originalPrice: val}))}} placeholder="Tùy chọn" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Tồn kho <span className="text-danger">*</span></label>
                    <input type="text" className="form-control rounded-0 w-100" name="quantity" value={formData.quantity} onChange={(e) => {const val = e.target.value.replace(/\D/g, ''); setFormData(p => ({...p, quantity: val}))}} required placeholder="Ví dụ: 100" />
                  </div>
                </div>
              </div>

              {/* Group: Kích thước (Variants) */}
              <div className="card rounded-0 border-light shadow-sm bg-white p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h6 className="fw-bold mb-0">Tùy chọn kích thước (Sizes)</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary rounded-0" onClick={handleAddVariant}>
                    <i className="fa-solid fa-plus me-1"></i> Thêm Size
                  </button>
                </div>
                {formData.variants.length === 0 ? (
                  <p className="text-muted small mb-0">Không có kích thước (chỉ có 1 size mặc định).</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0">
                      <thead className="small text-muted border-bottom">
                        <tr>
                          <th>Tên Size (VD: Size M)</th>
                          <th>Giá cộng thêm (VNĐ)</th>
                          <th className="text-end">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.variants.map((v, idx) => (
                          <tr key={idx}>
                            <td>
                              <input type="text" className="form-control rounded-0 w-100 form-control-sm" placeholder="Nhập tên size..." value={v.sizeName} onChange={(e) => handleUpdateVariant(idx, "sizeName", e.target.value)} required />
                            </td>
                            <td>
                              <input type="text" className="form-control rounded-0 w-100 form-control-sm text-success fw-bold" placeholder="0" value={v.priceAdjustment} onChange={(e) => {const val = e.target.value.replace(/\D/g, ''); handleUpdateVariant(idx, "priceAdjustment", val)}} required />
                            </td>
                            <td className="text-end">
                              <button type="button" className="btn btn-sm btn-danger rounded-circle" onClick={() => handleRemoveVariant(idx)}><i className="fa-solid fa-trash"></i></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>



              {/* Group 3: Hình ảnh */}
              <div className="card rounded-0 border-light shadow-sm bg-white p-4 mb-4">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Hình ảnh</h6>
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small d-block">Ảnh đại diện <span className="text-danger">*</span></label>
                    <div 
                      className="card rounded-0 border-light shadow-sm bg-white d-flex flex-column align-items-center justify-content-center overflow-hidden position-relative" 
                      style={{ height: "200px", border: "2px dashed rgba(0,0,0,0.1)", backgroundColor: "var(--admin-bg)", cursor: "pointer" }}
                      onClick={() => document.getElementById("mainImageInput").click()}
                    >
                      {previewMainImage ? (
                        <img src={previewMainImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up fs-1 text-muted mb-2"></i>
                          <span className="small text-muted">Nhấn để tải ảnh lên</span>
                        </>
                      )}
                      <input type="file" id="mainImageInput" className="d-none" accept="image/*" onChange={handleMainImageChange} />
                    </div>
                    {previewMainImage && (
                      <button type="button" className="btn btn-sm btn-link text-danger mt-2 w-100" onClick={() => { setPreviewMainImage(""); setFormData(p=>({...p, imageUrl: ""})) }}>
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                  
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small d-block">Gallery ảnh (Tối đa 5 ảnh)</label>
                    <div className="d-flex flex-wrap gap-3">
                      {previewGallery.map((img, idx) => (
                        <div key={idx} className="position-relative card rounded-0 border-light shadow-sm bg-white overflow-hidden" style={{ width: "100px", height: "100px" }}>
                          <img src={img} alt={`Gallery ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger position-absolute p-0 d-flex justify-content-center align-items-center rounded-circle shadow" 
                            style={{ top: "5px", right: "5px", width: "24px", height: "24px" }}
                            onClick={() => removeGalleryImage(idx)}
                          >
                            <i className="fa-solid fa-times" style={{ fontSize: "10px" }}></i>
                          </button>
                        </div>
                      ))}
                      
                      <div 
                        className="card rounded-0 border-light shadow-sm bg-white d-flex flex-column align-items-center justify-content-center" 
                        style={{ width: "100px", height: "100px", border: "2px dashed rgba(0,0,0,0.1)", backgroundColor: "var(--admin-bg)", cursor: "pointer" }}
                        onClick={() => document.getElementById("galleryInput").click()}
                      >
                        <i className="fa-solid fa-plus fs-3 text-muted"></i>
                        <input type="file" id="galleryInput" className="d-none" accept="image/*" multiple onChange={handleGalleryChange} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Fallback inputs for URLs just in case */}
                <div className="mt-3">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-link text-decoration-none small p-0" 
                    onClick={() => setFormData(prev => ({...prev, showUrlInput: !prev.showUrlInput}))}
                  >
                    <i className={`fa-solid fa-chevron-${formData.showUrlInput ? 'up' : 'down'} me-1`}></i>
                    Hoặc nhập link ảnh trực tiếp (URL)
                  </button>
                  
                  {formData.showUrlInput && (
                    <div className="mt-2 p-3 bg-light rounded border">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small text-muted mb-1">URL Ảnh đại diện</label>
                          <input type="text" className="form-control rounded-0 w-100 form-control-sm" placeholder="Nhập đường dẫn ảnh đại diện..." name="imageUrl" value={formData.imageUrl} onChange={(e) => {handleChange(e); setPreviewMainImage(e.target.value)}} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted mb-1">URL Gallery (cách nhau bởi dấu phẩy)</label>
                          <input type="text" className="form-control rounded-0 w-100 form-control-sm" placeholder="Nhập các đường dẫn gallery..." name="imageUrls" value={formData.imageUrls} onChange={(e) => {handleChange(e); if(e.target.value.trim()) setPreviewGallery(e.target.value.split(",").map(u=>u.trim()).filter(Boolean))}} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Group 4: Mô tả */}
              <div className="card rounded-0 border-light shadow-sm bg-white p-4 mb-4">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Mô tả sản phẩm</h6>
                <textarea className="form-control rounded-0 w-100" name="description" rows="5" placeholder="Nhập mô tả chi tiết sản phẩm..." value={formData.description} onChange={handleChange}></textarea>
              </div>

              {/* Group 5: Hiển thị */}
              <div className="card rounded-0 border-light shadow-sm bg-white p-4 mb-2">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Cờ hiển thị (Home & Danh mục)</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check form-switch d-flex align-items-center gap-2 m-0" style={{ width: "220px" }}>
                      <input className="form-check-input mt-0" type="checkbox" role="switch" id="toggleNew" name="newArrival" checked={formData.newArrival} onChange={handleChange} style={{ width: "40px", height: "20px", cursor: "pointer" }} />
                      <label className="form-check-label fw-semibold" htmlFor="toggleNew" style={{ cursor: "pointer" }}>Sản phẩm mới</label>
                    </div>
                    {formData.newArrival && (
                      <div className="d-flex align-items-center gap-2">
                        <label className="form-label mb-0 small text-muted">Thứ tự hiển thị (Nhỏ xếp trước):</label>
                        <input type="number" className="form-control rounded-0 form-control-sm text-center" name="newArrivalOrder" value={formData.newArrivalOrder} onChange={handleChange} min="0" style={{ width: "80px", height: "30px" }} />
                      </div>
                    )}
                  </div>
                  
                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check form-switch d-flex align-items-center gap-2 m-0" style={{ width: "220px" }}>
                      <input className="form-check-input mt-0" type="checkbox" role="switch" id="toggleSale" name="onSale" checked={formData.onSale} onChange={handleChange} style={{ width: "40px", height: "20px", cursor: "pointer" }} />
                      <label className="form-check-label fw-semibold" htmlFor="toggleSale" style={{ cursor: "pointer" }}>Sản phẩm khuyến mãi</label>
                    </div>
                    {formData.onSale && (
                      <div className="d-flex align-items-center gap-2">
                        <label className="form-label mb-0 small text-muted">Thứ tự hiển thị (Nhỏ xếp trước):</label>
                        <input type="number" className="form-control rounded-0 form-control-sm text-center" name="onSaleOrder" value={formData.onSaleOrder} onChange={handleChange} min="0" style={{ width: "80px", height: "30px" }} />
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check form-switch d-flex align-items-center gap-2 m-0" style={{ width: "220px" }}>
                      <input className="form-check-input mt-0" type="checkbox" role="switch" id="toggleHot" name="featured" checked={formData.featured} onChange={handleChange} style={{ width: "40px", height: "20px", cursor: "pointer" }} />
                      <label className="form-check-label fw-semibold" htmlFor="toggleHot" style={{ cursor: "pointer" }}>Sản phẩm bán chạy</label>
                    </div>
                    {formData.featured && (
                      <div className="d-flex align-items-center gap-2">
                        <label className="form-label mb-0 small text-muted">Thứ tự hiển thị (Nhỏ xếp trước):</label>
                        <input type="number" className="form-control rounded-0 form-control-sm text-center" name="featuredOrder" value={formData.featuredOrder} onChange={handleChange} min="0" style={{ width: "80px", height: "30px" }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer border-top-0 px-4 pb-4 pt-0 justify-content-end" style={{ backgroundColor: "var(--admin-bg)" }}>
            <button type="button" className="btn btn-outline-secondary rounded-0 px-4 bg-white" onClick={onClose} disabled={isUploading}>Hủy</button>
            <button type="submit" form="productForm" className="btn rounded-0 px-4 fw-bold" style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }} disabled={isUploading}>
              {isUploading ? (
                <><i className="fa-solid fa-spinner fa-spin me-2"></i> Đang tải ảnh...</>
              ) : (
                <><i className="fa-solid fa-save me-2"></i> {initialData ? "Lưu thay đổi" : "Tạo sản phẩm"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFormModal;
