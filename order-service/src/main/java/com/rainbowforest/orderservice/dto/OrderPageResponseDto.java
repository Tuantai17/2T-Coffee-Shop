package com.rainbowforest.orderservice.dto;

import java.util.List;

public class OrderPageResponseDto {
    private List<OrderAdminListDto> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private OrderStatisticsDto statistics;

    // Getters and Setters
    public List<OrderAdminListDto> getContent() { return content; }
    public void setContent(List<OrderAdminListDto> content) { this.content = content; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

    public OrderStatisticsDto getStatistics() { return statistics; }
    public void setStatistics(OrderStatisticsDto statistics) { this.statistics = statistics; }
}
