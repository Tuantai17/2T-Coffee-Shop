package com.rainbowforest.userservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserAddressResponseDTO {
    private Long id;
    private String recipientName;
    private String phone;
    private String addressType;
    private String provinceCode;
    private String provinceName;
    private String wardCode;
    private String wardName;
    private String detailAddress;
    private String districtName; // Keep for backward compatibility
    private String fullAddress;
    private boolean isDefault;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getFullAddress() {
        return fullAddress;
    }

    public void setFullAddress(String fullAddress) {
        this.fullAddress = fullAddress;
    }

    public boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    @JsonProperty("receiverName")
    public String getReceiverName() {
        return recipientName;
    }

    @JsonProperty("phoneNumber")
    public String getPhoneNumber() {
        return phone;
    }

    @JsonProperty("label")
    public String getLabel() {
        return addressType;
    }

    @JsonProperty("addressLine")
    public String getAddressLine() {
        return detailAddress;
    }

    @JsonProperty("ward")
    public String getWard() {
        return wardName;
    }

    @JsonProperty("district")
    public String getDistrict() {
        return districtName;
    }

    @JsonProperty("province")
    public String getProvince() {
        return provinceName;
    }

    @JsonProperty("default")
    public boolean getDefault() {
        return isDefault;
    }
}
