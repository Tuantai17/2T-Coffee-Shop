import React from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthBenefitBar from "../components/AuthBenefitBar";

function AuthLayout({ children, title }) {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  return (
    <div className="d-flex flex-column min-vh-100 auth-bg position-relative overflow-hidden">
      <Navbar />

      <main className="flex-grow-1 position-relative z-1 py-4 d-flex flex-column justify-content-center">
        <div className="container">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-muted">Trang chủ</Link>
              </li>
              <li className="breadcrumb-item text-muted">
                Tài khoản
              </li>
              <li className="breadcrumb-item active fw-medium" aria-current="page">
                {title}
              </li>
            </ol>
          </nav>

          {/* Form Content */}
          <div className="row justify-content-center">
            <div className={`col-12 ${isRegister ? "col-md-8 col-lg-6" : "col-md-7 col-lg-5"}`}>
              <div className="auth-card p-4 p-md-5">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthBenefitBar />
      <Footer />
    </div>
  );
}

export default AuthLayout;
