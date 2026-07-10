import React from "react";
import { useNavigate } from "react-router-dom";

function CheckoutStepper({ currentStep }) {
  const navigate = useNavigate();
  
  // currentStep can be 1 (Cart), 2 (Checkout), 3 (Confirm), 4 (Complete)
  
  const steps = [
    { id: 1, label: "Giỏ hàng", icon: "fa-cart-shopping", path: "/cart" },
    { id: 2, label: "Thanh toán", icon: "", path: "/checkout" },
    { id: 3, label: "Xác nhận", icon: "", path: null },
    { id: 4, label: "Hoàn thành", icon: "", path: null }
  ];

  const handleStepClick = (step) => {
    if (step.id < currentStep && step.path) {
      navigate(step.path);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-4 py-3 px-4 mb-4 mt-3">
      <div className="d-flex justify-content-between align-items-center position-relative">
        {/* Progress Line */}
        <div className="position-absolute top-50 start-0 end-0 translate-middle-y" style={{ zIndex: 1, padding: "0 10%" }}>
          <div className="progress" style={{ height: "2px" }}>
             <div 
               className="progress-bar bg-primary" 
               role="progressbar" 
               style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
             />
          </div>
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          let circleClass = "bg-white border text-muted";
          let labelClass = "text-muted";
          
          if (isActive) {
            circleClass = "bg-primary text-white border-primary shadow-sm";
            labelClass = "text-primary fw-bold";
          } else if (isCompleted) {
            circleClass = "bg-white border-primary text-primary";
            labelClass = "text-dark";
          }
          
          const clickable = isCompleted && step.path;

          return (
            <div 
              key={step.id} 
              className={`d-flex align-items-center bg-white z-2 position-relative px-2 ${clickable ? 'cursor-pointer' : ''}`}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
              onClick={() => handleStepClick(step)}
            >
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center ${circleClass}`}
                style={{ width: "32px", height: "32px", fontSize: "14px", fontWeight: isActive || isCompleted ? "600" : "400" }}
              >
                {step.id === 1 && step.icon ? <i className={`fa-solid ${step.icon}`}></i> : step.id}
              </div>
              <span className={`ms-2 d-none d-md-block ${labelClass}`} style={{ fontSize: "15px" }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CheckoutStepper;
