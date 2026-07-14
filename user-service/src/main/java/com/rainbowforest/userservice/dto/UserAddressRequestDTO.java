package com.rainbowforest.userservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class UserAddressRequestDTO {
    @JsonAlias("receiverName")
    @NotBlank(message = "recipientName is required")
    private String recipientName;

    @JsonAlias("phoneNumber")
    @NotBlank(message = "phone is required")
    private String phone;

    @JsonAlias("label")
    @NotBlank(message = "addressType is required")
    private String addressType;

    private String provinceCode;

    @JsonAlias("province")
    private String provinceName;

    private String wardCode;

    @JsonAlias("ward")
    private String wardName;

    @JsonAlias({"addressLine", "address"})
    @NotBlank(message = "detailAddress is required")
    private String detailAddress;

    @JsonAlias("district")
    private String districtName;

    @JsonAlias("default")
    private boolean isDefault;

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public String getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
    }

    public String getProvinceName() {
        return provinceName;
    }

    public void setProvinceName(String provinceName) {
        this.provinceName = provinceName;
    }

    public String getWardCode() {
        return wardCode;
    }

    public void setWardCode(String wardCode) {
        this.wardCode = wardCode;
    }

    public String getWardName() {
        return wardName;
    }

    public void setWardName(String wardName) {
        this.wardName = wardName;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public String getDistrictName() {
        return districtName;
    }

    public void setDistrictName(String districtName) {
        this.districtName = districtName;
    }

    public boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }
}
