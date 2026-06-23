package com.rainbowforest.orderservice.utilities;

import java.math.BigDecimal;
import java.util.List;

import com.rainbowforest.orderservice.domain.Item;

public class OrderUtilities {

    public static BigDecimal countTotalPrice(List<Item> cart){
        BigDecimal total = BigDecimal.ZERO;
        for(int i = 0; i < cart.size(); i++){
            total = total.add(cart.get(i).getSubTotal());
        }
        return total;
    }

    public static BigDecimal resolveDiscountAmount(BigDecimal subTotal, String voucherCode) {
        if (subTotal == null || voucherCode == null || voucherCode.isBlank()) {
            return BigDecimal.ZERO;
        }

        String normalized = voucherCode.trim().toUpperCase();
        if ("TOY10".equals(normalized)) {
            return subTotal.multiply(new BigDecimal("0.10"));
        }
        if ("FREESHIP".equals(normalized)) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    public static BigDecimal resolveShippingFee(BigDecimal subTotal) {
        if (subTotal == null) {
            return BigDecimal.ZERO;
        }
        return subTotal.compareTo(new BigDecimal("500000")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("30000");
    }
}
