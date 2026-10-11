package org.example.rural_demo.dto;

public class WorkOrderRejectDTO {
    private Long id;
    private String rejectReason;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
}