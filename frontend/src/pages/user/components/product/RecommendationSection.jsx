import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../../utils/formatPrice';

function RecommendationSection({ recommendationProducts = [] }) {
  // If no data, render skeleton
  if (!recommendationProducts || recommendationProducts.length === 0) {
    return (
      <div className="row g-4 mt-1">
        {/* Combo Banner Skeleton */}
        <div className="col-lg-5 col-md-6">
          <div className="rounded-4 p-4 shadow-sm h-100 placeholder-glow d-flex flex-column justify-content-center" style={{ minHeight: "160px", backgroundColor: "#fff" }}>
            <span className="placeholder col-6 mb-2 rounded"></span>
            <span className="placeholder col-8 mb-4 rounded placeholder-lg"></span>
            <span className="placeholder col-4 rounded-pill py-2"></span>
          </div>
        </div>

        {/* Newsletter Skeleton */}
        <div className="col-lg-7 col-md-6">
          <div className="brew-card rounded-4 p-4 shadow-sm h-100 bg-white d-flex flex-column justify-content-center placeholder-glow">
            <span className="placeholder col-4 mb-2 rounded"></span>
            <span className="placeholder col-7 mb-3 rounded"></span>
            <span className="placeholder col-12 rounded-pill" style={{ height: "40px" }}></span>
          </div>
        </div>
      </div>
    );
  }

  // Real data rendering would go here, but for now we just show the form layout
  return (
    <div className="row g-4 mt-1">
      {/* Dynamic contents when API is ready */}
      <div className="col-lg-12 text-center text-muted">
        <p>Recommendations ready to display.</p>
      </div>
    </div>
  );
}

export default RecommendationSection;
