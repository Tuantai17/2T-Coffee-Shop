import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getCart, clearCart } from "../../services/cartService";
import { createOrder } from "../../services/orderService";
import { getDefaultAddress, addUserAddress } from "../../services/addressService";
import { getUserProfile } from "../../services/authService";
import { AUTH_SCOPES, getAuthSession } from "../../utils/authStorage";
import loyaltyApi from "../../api/loyaltyApi";
import { createPayment } from "../../services/paymentService";

import CheckoutStepper from "./components/checkout/CheckoutStepper";
import AddressSelectorModal from "./components/checkout/AddressSelectorModal";
import AddressFormModal from "./components/profile/AddressFormModal";
import VoucherModal from "./components/cart/VoucherModal";
import DeliveryMethodCard from "./components/checkout/DeliveryMethodCard";
import ScheduleCard from "./components/checkout/ScheduleCard";
import CustomerInfoCard from "./components/checkout/CustomerInfoCard";
import PaymentMethodCard from "./components/checkout/PaymentMethodCard";
import OrderSummaryCard from "./components/checkout/OrderSummaryCard";
import SecurityCard from "./components/checkout/SecurityCard";

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);

  const [form, setForm] = useState({
    receiverName: "",
    phone: "",
    email: "",
    note: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState("DELIVERY");
  const [scheduleType, setScheduleType] = useState("NOW");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [voucherCode, setVoucherCode] = useState(location.state?.voucherCode || "");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [pointsAvailable, setPointsAvailable] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);

  const subTotal = cart.reduce(
    (total, item) => total + (item.subTotal || ((item.product ? item.product.price : 0) * item.quantity)),
    0
  );
  const pointDiscount = pointsUsed * 10;
  const shippingFee = deliveryMethod === "PICKUP" ? 0 : (subTotal >= 500000 ? 0 : (cart.length > 0 ? 20000 : 0));
  const discount = appliedVoucher ? Number(appliedVoucher.discountAmount || 0) : 0;
  const grandTotal = Math.max(0, subTotal - discount - pointDiscount + shippingFee);
  const loyaltyPointsEarned = Math.floor(grandTotal / 1000);

  const loadCart = async () => {
    try {
      const response = await getCart();
      const cartData = Array.isArray(response.data) ? response.data : [];
      setCart(cartData);
      if (cartData.length === 0 && !loadingCart) {
        setSubmitError("Gio hang cua ban dang trong.");
        setTimeout(() => navigate("/cart"), 1500);
      }
    } catch (error) {
      setCart([]);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      loadCart();
      const { userId, email } = getAuthSession(AUTH_SCOPES.USER);
      if (!userId) {
        navigate("/login?returnUrl=/checkout");
        return;
      }

      setForm((prev) => ({ ...prev, email: email || "" }));

      try {
        const [profileRes, loyaltyRes, voucherRes] = await Promise.all([
          getUserProfile(userId),
          loyaltyApi.getMyLoyaltyAccount(),
          loyaltyApi.getMyVouchers(),
        ]);
        const profileEmail = profileRes?.data?.userDetails?.email || profileRes?.data?.email || profileRes?.data?.userName;
        if (profileEmail) {
          setForm((prev) => ({ ...prev, email: profileEmail }));
        }
        setPointsAvailable(Number(loyaltyRes?.data?.availablePoints || 0));
        setAvailableVouchers((Array.isArray(voucherRes?.data) ? voucherRes.data : []).filter((voucher) => voucher.canApply));
      } catch (error) {
        // noop
      }

      loadDefaultAddress(userId);
    };

    init();
  }, []);

  useEffect(() => {
    if (!voucherCode || subTotal <= 0) return;
    if (location.state?.voucherCode) {
      handleApplyVoucher(location.state.voucherCode);
    }
  }, [subTotal]);

  const loadDefaultAddress = async (userId) => {
    try {
      const response = await getDefaultAddress(userId);
      if (response.data) {
        const addr = response.data;
        setSelectedAddress(addr);
        setForm((prev) => ({
          ...prev,
          receiverName: addr.receiverName || prev.receiverName,
          phone: addr.phoneNumber || prev.phone,
        }));
      }
    } catch (error) {
      // noop
    }
  };

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    setForm((prev) => ({
      ...prev,
      receiverName: addr.receiverName || "",
      phone: addr.phoneNumber || "",
    }));
    setShowAddressSelector(false);
  };

  const handleSaveNewAddress = async (addressData) => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) return;

    try {
      if (addressData.saveToAddressBook) {
        const res = await addUserAddress(userId, addressData);
        handleAddressSelect(res.data || { ...addressData, id: Date.now() });
      } else {
        handleAddressSelect({ ...addressData, id: "temp-" + Date.now() });
      }
      setShowAddressForm(false);
    } catch (error) {
      setSubmitError("Loi khi them dia chi.");
    }
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleApplyVoucher = async (manualCode) => {
    const codeToUse = (manualCode || voucherCode || "").trim();
    if (!codeToUse) {
      setSubmitError("Vui long nhap ma voucher");
      return;
    }
    try {
      const response = await loyaltyApi.previewCheckoutVoucher({
        voucherCode: codeToUse,
        orderTotal: subTotal,
      });
      setAppliedVoucher(response?.data || null);
      setVoucherCode(codeToUse);
      setSubmitError("");
    } catch (error) {
      setAppliedVoucher(null);
      setSubmitError(error?.response?.data?.message || "Voucher khong hop le hoac khong ap dung duoc");
    }
  };

  const handleChangeVoucher = (value) => {
    setVoucherCode(value);
    setVoucherError("");
    if (!value) {
      setAppliedVoucher(null);
    }
  };

  const handleCheckout = async () => {
    const { userId } = getAuthSession(AUTH_SCOPES.USER);
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!cart.length) {
      setSubmitError("Gio hang dang trong.");
      return;
    }

    if (deliveryMethod === "DELIVERY") {
      if (!selectedAddress) {
        setSubmitError("Vui long chon dia chi nhan hang.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!form.receiverName.trim() || !form.phone.trim()) {
        setSubmitError("Vui long dien day du ten nguoi nhan va so dien thoai.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setSubmitError("");
    setLoadingSubmit(true);
    try {
      const payload = {
        receiverName: deliveryMethod === "PICKUP" ? (form.receiverName || "Khach hang") : form.receiverName,
        phone: deliveryMethod === "PICKUP" ? (form.phone || "0000") : form.phone,
        address: deliveryMethod === "PICKUP" ? "Brew Moments Flagship, Q1, HCM" : selectedAddress.addressLine,
        province: deliveryMethod === "PICKUP" ? "HCM" : selectedAddress.province,
        district: deliveryMethod === "PICKUP" ? "Q1" : selectedAddress.district,
        ward: deliveryMethod === "PICKUP" ? "Phuong Da Kao" : selectedAddress.ward,
        paymentMethod,
        note: form.note,
        voucherCode: appliedVoucher ? appliedVoucher.voucherCode : "",
        email: form.email,
        fulfillmentType: deliveryMethod,
      };

      const res = await createOrder(Number(userId), payload);
      const orderId = res.data?.id || res.data?.orderId || res.data?.orderCode;

      if (paymentMethod === "VNPAY") {
        try {
          const paymentRes = await createPayment({
            orderId,
            paymentMethod,
            ipAddress: "127.0.0.1"
          });
          if (paymentRes.data?.paymentUrl) {
            sessionStorage.setItem("pendingPaymentOrderId", String(orderId));
            window.location.href = paymentRes.data.paymentUrl;
            return;
          }
          throw new Error("Khong nhan duoc lien ket thanh toan VNPay.");
        } catch (paymentErr) {
          setSubmitError(paymentErr?.response?.data?.message || "Loi khoi tao cong thanh toan. Don hang da duoc luu, vui long vao lich su don hang de thanh toan lai.");
          navigate(`/order-success/${orderId}`, {
            state: {
              paymentNotice: "Don hang da duoc tao, nhung chua khoi tao duoc lien ket VNPay. Vui long vao lich su don hang de thanh toan lai.",
            },
          });
          return;
        }
      }

      await clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Dat hang that bai. Vui long thu lai.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const getFullAddressString = (addr) => {
    if (!addr) return "";
    return [addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(", ");
  };

  return (
    <UserLayout>
      <div style={{ backgroundColor: "#FAF8F4", minHeight: "100vh", paddingTop: "20px" }}>
        <div className="container pb-5">
          <CheckoutStepper currentStep={2} />

          {submitError && (
            <div className="alert alert-danger shadow-sm border-0 rounded-4 d-flex align-items-center gap-2 mb-4">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{submitError}</span>
            </div>
          )}

          <div className="row g-4 mt-1">
            <div className="col-lg-7">
              <DeliveryMethodCard
                deliveryMethod={deliveryMethod}
                onChangeMethod={setDeliveryMethod}
                selectedAddress={selectedAddress}
                onOpenAddressSelector={() => setShowAddressSelector(true)}
                onOpenAddressForm={() => setShowAddressForm(true)}
                form={form}
                onChangeForm={handleChangeForm}
                getFullAddressString={getFullAddressString}
              />

              <ScheduleCard scheduleType={scheduleType} onChangeType={setScheduleType} />

              <CustomerInfoCard form={form} onChangeForm={handleChangeForm} />

              <PaymentMethodCard paymentMethod={paymentMethod} onChangePayment={setPaymentMethod} />
            </div>

            <div className="col-lg-5">
              <OrderSummaryCard
                cart={cart}
                subTotal={subTotal}
                shippingFee={shippingFee}
                discount={discount}
                pointDiscount={pointDiscount}
                grandTotal={grandTotal}
                loadingSubmit={loadingSubmit}
                onSubmit={handleCheckout}
                loyaltyPointsEarned={loyaltyPointsEarned}
                appliedVoucher={appliedVoucher}
                onApplyVoucherCode={(code) => handleApplyVoucher(code)}
                onOpenVoucherModal={() => setShowVoucherModal(true)}
                onRemoveVoucher={() => {
                  setAppliedVoucher(null);
                  setVoucherCode("");
                }}
                totalPoints={pointsAvailable}
                onApplyPoints={setPointsUsed}
              />
              <SecurityCard />
            </div>
          </div>
        </div>
      </div>

      <AddressSelectorModal
        show={showAddressSelector}
        onClose={() => setShowAddressSelector(false)}
        onSelect={handleAddressSelect}
        currentAddressId={selectedAddress?.id}
        onAddNew={() => {
          setShowAddressSelector(false);
          setShowAddressForm(true);
        }}
      />

      <AddressFormModal
        show={showAddressForm}
        onClose={() => setShowAddressForm(false)}
        onSave={handleSaveNewAddress}
        address={null}
      />

      <VoucherModal
        show={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        vouchers={availableVouchers}
        onSelect={(voucher) => {
          setVoucherCode(voucher.code);
          handleApplyVoucher(voucher.code);
        }}
      />
    </UserLayout>
  );
}

export default CheckoutPage;
