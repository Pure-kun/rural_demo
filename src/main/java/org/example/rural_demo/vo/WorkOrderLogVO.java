package org.example.rural_demo.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkOrderLogVO {
    private Long id;
    private Integer fromStatus;
    private String fromStatusDesc;
    private Integer toStatus;
    private String toStatusDesc;
    private String operatorName;
    private String remark;
    private LocalDateTime createTime;
}