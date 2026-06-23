import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts
} from "../../services/productService";
import CategoryFilterBar from "./categories/CategoryFilterBar";
import CategoryTreeList from "./categories/CategoryTreeList";
import CategoryFormModal from "./categories/CategoryFormModal";

function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filtering state
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  
  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        getCategories(),
        getProducts() // Fetch products to calculate product count
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
    } catch (error) {
      console.error(error);
      showStatus("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (message, type = "success") => {
    setStatusMsg({ message, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // --- Calculate Product Counts & Build Tree ---
  const categoriesWithCount = useMemo(() => {
    return categories.map(cat => {
      // Find products that belong directly to this category
      const count = products.filter(p => String(p.categoryId || p.category) === String(cat.id)).length;
      return { ...cat, productCount: count };
    });
  }, [categories, products]);

  const treeDataRaw = useMemo(() => {
    const parentMap = new Map();
    const roots = [];

    // First pass: put all categories in a map
    categoriesWithCount.forEach(cat => {
      parentMap.set(String(cat.id), { ...cat, children: [] });
    });

    // Second pass: build the tree
    categoriesWithCount.forEach(cat => {
      const node = parentMap.get(String(cat.id));
      if (cat.parentId && parentMap.has(String(cat.parentId))) {
        parentMap.get(String(cat.parentId)).children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Calculate total product count for parents (including children) if needed, 
    // but the requirement says "Nếu Backend chỉ trả số sản phẩm trực tiếp, phải hiển thị rõ đó là số trực tiếp." 
    // We will just show direct count for now to avoid confusion unless requested.
    return roots;
  }, [categoriesWithCount]);

  // --- Filter Logic ---
  const handleApplyFilter = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilter = () => {
    setFilters({});
    setAppliedFilters({});
  };

  const filteredTreeData = useMemo(() => {
    let result = [...treeDataRaw];
    const { search, level, parentId, hasProducts } = appliedFilters;

    // We need to flatten and re-build or just filter the flattened list.
    // The requirement says: "Nếu kết quả là danh mục con, phải tự động mở danh mục cha chứa nó."
    // For simplicity, we filter the raw array and then rebuild the tree for the filtered items.

    let filteredFlat = [...categoriesWithCount];

    if (search) {
      const q = search.toLowerCase();
      filteredFlat = filteredFlat.filter(c => 
        (c.name || "").toLowerCase().includes(q) ||
        (c.slug || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
      // If a child matches, we must include its parent so the tree builds correctly.
      const parentIdsToInclude = new Set(filteredFlat.map(c => c.parentId).filter(Boolean));
      parentIdsToInclude.forEach(pid => {
        if (!filteredFlat.some(c => String(c.id) === String(pid))) {
          const parent = categoriesWithCount.find(c => String(c.id) === String(pid));
          if (parent) filteredFlat.push(parent);
        }
      });
    }

    if (level) {
      if (level === "parent") {
        filteredFlat = filteredFlat.filter(c => !c.parentId);
      } else if (level === "child") {
        filteredFlat = filteredFlat.filter(c => c.parentId);
      }
    }

    if (parentId) {
      filteredFlat = filteredFlat.filter(c => String(c.parentId) === String(parentId) || String(c.id) === String(parentId));
    }

    if (hasProducts) {
      if (hasProducts === "yes") {
        filteredFlat = filteredFlat.filter(c => c.productCount > 0);
      } else if (hasProducts === "no") {
        filteredFlat = filteredFlat.filter(c => c.productCount === 0);
      }
    }

    // Rebuild tree from filtered list
    const filteredParentMap = new Map();
    const filteredRoots = [];

    filteredFlat.forEach(cat => {
      filteredParentMap.set(String(cat.id), { ...cat, children: [] });
    });

    filteredFlat.forEach(cat => {
      const node = filteredParentMap.get(String(cat.id));
      if (cat.parentId && filteredParentMap.has(String(cat.parentId))) {
        filteredParentMap.get(String(cat.parentId)).children.push(node);
      } else {
        filteredRoots.push(node);
      }
    });

    return filteredRoots;
  }, [treeDataRaw, categoriesWithCount, appliedFilters]);

  // --- Selection Logic ---
  const handleSelectAll = (checked, visibleNodes) => {
    if (checked) {
      setSelectedIds(visibleNodes.map(node => node.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // --- Actions ---
  const validateDelete = (categoryId) => {
    // Find node in tree
    const node = categoriesWithCount.find(c => c.id === categoryId);
    if (!node) return null;

    if (node.productCount > 0) {
      return `Không thể xóa danh mục "${node.name}" vì vẫn còn ${node.productCount} sản phẩm.`;
    }
    
    // check if it has children
    const hasChildren = categoriesWithCount.some(c => c.parentId === categoryId);
    if (hasChildren) {
      return `Không thể xóa danh mục cha "${node.name}" khi vẫn còn danh mục con.`;
    }

    return null;
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    // Validate
    const validIds = [];
    const invalidMessages = [];
    let productsCount = 0;
    let childrenCount = 0;

    selectedIds.forEach(id => {
      const error = validateDelete(id);
      if (error) {
        if (error.includes("sản phẩm")) productsCount++;
        if (error.includes("danh mục con")) childrenCount++;
        invalidMessages.push(error);
      } else {
        validIds.push(id);
      }
    });

    if (validIds.length === 0) {
      alert(`Không có danh mục nào đủ điều kiện xóa.\n\nNguyên nhân:\n- ${productsCount} danh mục đang chứa sản phẩm.\n- ${childrenCount} danh mục đang chứa danh mục con.`);
      return;
    }

    let confirmMsg = `Bạn đã chọn ${selectedIds.length} danh mục:\n`;
    confirmMsg += `- ${validIds.length} danh mục đủ điều kiện xóa.\n`;
    if (productsCount > 0) confirmMsg += `- ${productsCount} danh mục đang chứa sản phẩm.\n`;
    if (childrenCount > 0) confirmMsg += `- ${childrenCount} danh mục đang chứa danh mục con.\n`;
    confirmMsg += `\nBạn có muốn tiến hành xóa ${validIds.length} danh mục hợp lệ không?`;

    if (!window.confirm(confirmMsg)) return;
    
    setLoading(true);
    let successCount = 0;
    for (const id of validIds) {
      try {
        await deleteCategory(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete ${id}`, e);
      }
    }
    
    showStatus(`Đã xóa thành công ${successCount}/${validIds.length} danh mục.`);
    setSelectedIds([]);
    loadData();
  };

  const handleDelete = async (node) => {
    const error = validateDelete(node.id);
    if (error) {
      alert(error + "\n\nVui lòng chuyển hoặc xóa các dữ liệu liên quan trước.");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục '${node.name}'? Thao tác này không thể hoàn tác.`)) return;
    
    try {
      await deleteCategory(node.id);
      showStatus("Xóa danh mục thành công!");
      setSelectedIds(prev => prev.filter(i => i !== node.id));
      loadData();
    } catch (error) {
      showStatus("Xóa danh mục thất bại!", "error");
    }
  };

  const mapFormToPayload = (form) => ({
    name: form.name,
    description: form.description || null,
    slug: form.slug || null,
    parentId: form.parentId ? Number(form.parentId) : null,
    imageUrl: form.imageUrl || null,
  });

  const handleSubmitForm = async (formData) => {
    setLoading(true);
    try {
      const payload = mapFormToPayload(formData);
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showStatus("Cập nhật danh mục thành công!");
      } else {
        await createCategory(payload);
        showStatus("Thêm danh mục mới thành công!");
      }
      setShowModal(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error(error);
      showStatus("Lưu danh mục thất bại!", "error");
      setLoading(false); 
    }
  };

  const parentCategories = categoriesWithCount.filter(c => !c.parentId);

  return (
    <AdminLayout>
      <div className="container-fluid px-0">
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "var(--admin-text)" }}>Quản lý danh mục</h3>
            <p className="mb-0 text-muted">Quản lý cấu trúc danh mục sản phẩm theo dạng cây và số lượng sản phẩm trong từng danh mục.</p>
          </div>
          <div className="d-flex gap-3 align-items-center">
            {statusMsg && (
              <div className={`badge bg-${statusMsg.type === 'error' ? 'danger' : 'success'} px-3 py-2 rounded-pill shadow-sm animate__animated animate__fadeIn`}>
                {statusMsg.message}
              </div>
            )}
            <button className="neu-pill text-decoration-none" onClick={loadData} title="Làm mới">
              <i className="fa-solid fa-rotate-right me-2"></i> Làm mới
            </button>
            {selectedIds.length > 0 && (
              <button className="neu-pill text-danger text-decoration-none border-danger" onClick={handleDeleteSelected}>
                <i className="fa-regular fa-trash-can me-2"></i> Xóa đã chọn ({selectedIds.length})
              </button>
            )}
            <button 
              className="neu-pill text-decoration-none" 
              style={{ backgroundColor: "var(--admin-primary)", color: "#fff" }}
              onClick={() => { setEditingCategory(null); setShowModal(true); }}
            >
              <i className="fa-solid fa-plus me-2"></i> Thêm danh mục
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <CategoryFilterBar 
          filters={filters} 
          setFilters={setFilters} 
          parentCategories={parentCategories}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />

        {/* Selection Info */}
        {selectedIds.length > 0 && (
          <div className="mb-3 text-primary fw-semibold small">
            Đã chọn {selectedIds.length} danh mục.
          </div>
        )}

        {/* Category Tree Table */}
        <CategoryTreeList 
          treeData={filteredTreeData}
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onEdit={(cat) => { setEditingCategory(cat); setShowModal(true); }}
          onDelete={handleDelete}
        />

        {/* Form Modal */}
        <CategoryFormModal 
          show={showModal}
          onClose={() => { setShowModal(false); setEditingCategory(null); }}
          initialData={editingCategory}
          parentCategories={parentCategories}
          onSubmit={handleSubmitForm}
        />

      </div>
    </AdminLayout>
  );
}

export default AdminCategoryPage;
