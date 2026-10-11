package org.example.rural_demo.vo;

import lombok.Data;

@Data
public class WorkOrderStatsVO {
    private long totalCount;
    private long pendingCount;
    private long acceptedCount;
    private long completedCount;
    private long ratedCount;
    private long rejectedCount;
    private long closedCount;
    private long urgedCount;
    private double avgRating;
    private double completionRate;
    private double avgHandleHours;
}