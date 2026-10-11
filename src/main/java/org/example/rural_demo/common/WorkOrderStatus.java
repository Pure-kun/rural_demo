package org.example.rural_demo.common;

public enum WorkOrderStatus {
    PENDING(0, "待处理"),
    ACCEPTED(1, "已受理"),
    COMPLETED(2, "已完成"),
    RATED(3, "已评价"),
    REJECTED(4, "已驳回"),
    CLOSED(5, "已关闭");

    private final int code;
    private final String desc;

    WorkOrderStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public int getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }

    public static WorkOrderStatus fromCode(int code) {
        for (WorkOrderStatus s : values()) {
            if (s.code == code) return s;
        }
        throw new IllegalArgumentException("非法工单状态码: " + code);
    }
}