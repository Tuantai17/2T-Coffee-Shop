import React from 'react';
import { formatPrice } from '../../../../utils/formatPrice';
import { applyImageFallback, resolveImageUrl } from '../../../../utils/imageFallback';

function ToppingSelector({ toppings = [], selectedToppings = [], onToppingChange }) {
  if (!toppings || toppings.length === 0) return null;

  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
        5. Topping <span className="text-muted fw-normal small">(Chọn thêm)</span>
      </h6>
      <div className="row g-3">
        {toppings.map((topping) => {
          const quantity = selectedToppings.filter(id => id === topping.id).length;
          const isSelected = quantity > 0;

          return (
            <div className="col-6 col-md-4" key={topping.id}>
              <div
                className={`w-100 position-relative rounded-4 p-2 border text-center transition-all ${isSelected ? "border-danger bg-danger-subtle" : "border-light bg-white hover-border-danger"
                  }`}
                style={{ cursor: isSelected ? "default" : "pointer", height: "100%", minHeight: "130px" }}
                onClick={(e) => {
                  if (!isSelected) {
                    onToppingChange(topping.id, 1);
                  }
                }}
              >
                <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2 pb-4">
                  <div className="rounded-circle overflow-hidden bg-light shadow-sm d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                    {topping.imageUrl ? (
                      <img
                        src={resolveImageUrl(topping.imageUrl)}
                        alt={topping.name}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => applyImageFallback(e, "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=100")}
                      />
                    ) : (
                      <i className="fa-solid fa-candy-cane text-muted"></i>
                    )}
                  </div>
                  <div>
                    <div className={`fw-semibold small lh-sm mb-1 ${isSelected ? "text-danger" : "text-dark"}`}>
                      {topping.name}
                    </div>
                    <div className="small text-muted fw-medium" style={{ fontSize: "0.75rem" }}>
                      +{formatPrice(topping.price)}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-center">
                    <div className="d-flex align-items-center bg-white rounded-pill px-2 py-1 shadow-sm border border-danger" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-link text-danger p-0 d-flex align-items-center justify-content-center"
                        style={{ width: "20px", height: "20px", textDecoration: "none" }}
                        onClick={() => onToppingChange(topping.id, quantity - 1)}
                      >
                        <i className="fa-solid fa-minus" style={{ fontSize: "10px" }}></i>
                      </button>
                      <span className="fw-bold mx-2" style={{ fontSize: "12px", width: "16px", textAlign: "center" }}>{quantity}</span>
                      <button 
                        className="btn btn-sm btn-link text-danger p-0 d-flex align-items-center justify-content-center"
                        style={{ width: "20px", height: "20px", textDecoration: "none" }}
                        onClick={() => onToppingChange(topping.id, quantity + 1)}
                      >
                        <i className="fa-solid fa-plus" style={{ fontSize: "10px" }}></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ToppingSelector;
