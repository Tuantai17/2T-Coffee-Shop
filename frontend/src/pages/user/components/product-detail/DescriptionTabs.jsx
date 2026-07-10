import React, { useState, useRef, useEffect } from 'react';

function DescriptionTabs({ product }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      // Check if content height exceeds the collapsed max-height (e.g., 100px)
      if (contentRef.current.scrollHeight > 100) {
        setIsOverflowing(true);
      }
    }
  }, [product?.description]);

  return (
    <div className="mb-4">
      <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Mô tả sản phẩm</h5>
      <div className="position-relative">
        <div 
          ref={contentRef}
          className="text-muted overflow-hidden" 
          style={{ 
            lineHeight: "1.8", 
            maxHeight: isExpanded ? "2000px" : "100px",
            transition: "max-height 0.4s ease-in-out",
            maskImage: (!isExpanded && isOverflowing) ? "linear-gradient(to bottom, black 40%, transparent 100%)" : "none",
            WebkitMaskImage: (!isExpanded && isOverflowing) ? "linear-gradient(to bottom, black 40%, transparent 100%)" : "none"
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: product?.description || "Chưa có mô tả cho sản phẩm này." }} />
        </div>
        
        {isOverflowing && (
          <div className="text-center mt-2">
            <button 
              className="btn btn-link text-danger text-decoration-none fw-bold p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Thu gọn" : "Xem tất cả"} <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} ms-1`}></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DescriptionTabs;
