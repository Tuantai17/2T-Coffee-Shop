import React, { useEffect, useState } from "react";
import { getProductById, getOptionGroups } from "../../../../services/productService";
import { addToCart, removeCartItem, updateCartItemQuantity } from "../../../../services/cartService";
import SizeSelector from "../product-detail/SizeSelector";
import IceSugarSelector from "../product-detail/IceSugarSelector";
import ToppingSelector from "../product-detail/ToppingSelector";
import QuantityNote from "../product-detail/QuantityNote";
import { resolveImageUrl, applyImageFallback, DEFAULT_IMAGE_FALLBACK } from "../../../../utils/imageFallback";

function EditCartItemModal({ show, onClose, item, globalToppings = [], onCartUpdated }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalOptionGroups, setGlobalOptionGroups] = useState([]);

  // Form States
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedTemp, setSelectedTemp] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    if (show && item) {
      loadData();
    } else {
      setProduct(null);
    }
  }, [show, item]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, optRes] = await Promise.all([
        getProductById(item.productId),
        getOptionGroups()
      ]);
      const prod = prodRes.data;
      const allOptionGroups = optRes.data || [];
      
      setProduct(prod);
      setGlobalOptionGroups(allOptionGroups);

      // Initialize states from item
      setQuantity(item.quantity || 1);
      setNote(item.note || "");
      setSelectedSize(item.variantId || null);
      
      const optionIds = item.optionIds || [];
      const tempGroup = allOptionGroups.find(g => g.name.toLowerCase().includes('nhiệt'));
      const iceGroup = allOptionGroups.find(g => g.name.toLowerCase().includes('đá') || g.name.toLowerCase().includes('ice'));
      const sugarGroup = allOptionGroups.find(g => g.name.toLowerCase().includes('ngọt') || g.name.toLowerCase().includes('sugar') || g.name.toLowerCase().includes('đường'));

      if (tempGroup) {
        const found = tempGroup.options.find(o => optionIds.includes(o.id));
        setSelectedTemp(found ? found.id : (tempGroup.options[0]?.id || 'cold'));
      }
      
      if (iceGroup) {
        const found = iceGroup.options.find(o => optionIds.includes(o.id));
        setSelectedIce(found ? found.id : null);
      }
      
      if (sugarGroup) {
        const found = sugarGroup.options.find(o => optionIds.includes(o.id));
        setSelectedSugar(found ? found.id : null);
      }

      setSelectedToppings(item.toppingIds || []);
      
    } catch (error) {
      console.error("Failed to load product details for edit", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToppingChange = (toppingId, newQuantity) => {
    setSelectedToppings(prev => {
      const others = prev.filter(id => id !== toppingId);
      const added = Array(newQuantity).fill(toppingId);
      return [...others, ...added];
    });
  };

  const handleSave = async () => {
    if (!product) return;
    setIsSaving(true);
    try {
      // Check if anything other than quantity/note changed
      const oldVariantId = item.variantId;
      const oldOptionIds = [...(item.optionIds || [])].sort().join(',');
      const oldToppingIds = [...(item.toppingIds || [])].sort().join(',');

      const newOptionIds = [];
      if (selectedTemp && !isNaN(Number(selectedTemp))) newOptionIds.push(Number(selectedTemp));
      if (selectedIce && !isNaN(Number(selectedIce))) newOptionIds.push(Number(selectedIce));
      if (selectedSugar && !isNaN(Number(selectedSugar))) newOptionIds.push(Number(selectedSugar));
      
      const optionsChanged = 
        oldVariantId !== selectedSize || 
        oldOptionIds !== newOptionIds.sort().join(',') || 
        oldToppingIds !== [...selectedToppings].sort().join(',');
      
      const noteChanged = (item.note || "") !== (note || "");

      if (optionsChanged || noteChanged) {
        // Need to remove old item and add new item
        await removeCartItem(item.cartItemId);
        await addToCart(product.id, quantity, {
          variantId: selectedSize,
          optionIds: newOptionIds,
          toppingIds: selectedToppings.filter(id => !isNaN(Number(id))).map(id => Number(id)),
          note: note || null,
        });
      } else if (quantity !== item.quantity) {
        // Only quantity changed
        await updateCartItemQuantity(item.cartItemId, quantity);
      }
      
      if (onCartUpdated) onCartUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Cập nhật tùy chọn thất bại!");
    } finally {
      setIsSaving(false);
    }
  };

  if (!show) return null;

  // Helper to safely sort options
  const sortOptions = (options) => [...options].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  let apiSizes = [];
  let apiTemps = [];
  let apiIceLevels = [];
  let apiSugarLevels = [];
  
  if (product) {
    apiSizes = product.variants ? product.variants.map((v, index) => ({ id: v.id || `var-${index}`, name: v.sizeName, price: v.priceAdjustment })) : [];
    const tempGroup = globalOptionGroups.find(g => g.name.toLowerCase().includes('nhiệt'));
    apiTemps = tempGroup ? sortOptions(tempGroup.options).map(o => ({ id: o.id, name: o.name })) : [];
    const iceGroup = globalOptionGroups.find(g => g.name.toLowerCase().includes('đá') || g.name.toLowerCase().includes('ice'));
    apiIceLevels = iceGroup ? sortOptions(iceGroup.options).map(o => ({ id: o.id, name: o.name })) : [];
    const sugarGroup = globalOptionGroups.find(g => g.name.toLowerCase().includes('ngọt') || g.name.toLowerCase().includes('sugar') || g.name.toLowerCase().includes('đường'));
    apiSugarLevels = sugarGroup ? sortOptions(sugarGroup.options).map(o => ({ id: o.id, name: o.name })) : [];
  }

  const apiToppings = sortOptions(globalToppings);

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold">Điều chỉnh tùy chọn</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={isSaving}></button>
            </div>
            
            <div className="modal-body py-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger" role="status"></div>
                  <div className="mt-2 text-muted">Đang tải thông tin sản phẩm...</div>
                </div>
              ) : !product ? (
                <div className="text-center py-5 text-muted">
                  Không thể tải thông tin sản phẩm!
                </div>
              ) : (
                <div className="row g-4">
                   <div className="col-md-4">
                     <div className="rounded-4 overflow-hidden bg-light mb-3" style={{ aspectRatio: "1/1" }}>
                       <img src={resolveImageUrl(product.imageUrl)} alt={product.name} className="w-100 h-100 object-fit-cover" onError={(e) => applyImageFallback(e, DEFAULT_IMAGE_FALLBACK)} />
                     </div>
                     <h5 className="fw-bold mb-1">{product.name}</h5>
                     <div className="text-danger fw-bold mb-4">{product.price?.toLocaleString()}đ</div>
                     <QuantityNote quantity={quantity} maxQuantity={product.quantity || 99} onQuantityChange={setQuantity} note={note} onNoteChange={setNote} />
                   </div>
                   <div className="col-md-8">
                     <div className="px-md-2" style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "hidden" }}>
                        {apiSizes.length > 0 && (
                          <SizeSelector sizes={apiSizes} selectedSize={selectedSize} onSizeChange={setSelectedSize} />
                        )}
                        
                        {(!apiTemps.length || (apiTemps.length > 0 && apiTemps.find(t => t.id === selectedTemp)?.name?.toLowerCase().includes('lạnh'))) && apiIceLevels.length > 0 && (
                          <IceSugarSelector type="ice" title={<>Độ đá <span className="text-danger">*</span></>} levels={apiIceLevels} selectedLevel={selectedIce} onLevelChange={setSelectedIce} />
                        )}
                        {apiSugarLevels.length > 0 && (
                          <IceSugarSelector type="sugar" title={<>Độ ngọt <span className="text-danger">*</span></>} levels={apiSugarLevels} selectedLevel={selectedSugar} onLevelChange={setSelectedSugar} />
                        )}
                        
                        {apiToppings.length > 0 && (
                          <ToppingSelector toppings={apiToppings} selectedToppings={selectedToppings} onToppingChange={handleToppingChange} />
                        )}
                     </div>
                   </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer border-top-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose} disabled={isSaving}>Hủy</button>
              <button type="button" className="btn btn-danger rounded-pill px-5 fw-bold" onClick={handleSave} disabled={isSaving || loading || !product}>
                {isSaving ? <span className="spinner-border spinner-border-sm me-2"></span> : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {show && (
        <style>{`
          body { overflow: hidden; }
        `}</style>
      )}
    </>
  );
}

export default EditCartItemModal;
