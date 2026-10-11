package org.example.rural_demo.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import org.example.rural_demo.dto.*;
import org.example.rural_demo.entity.WorkOrder;
import org.example.rural_demo.entity.WorkOrderLog;
import org.example.rural_demo.vo.WorkOrderStatsVO;

import java.util.List;

public interface WorkOrderService extends IService<WorkOrder> {

    void submitWorkOrder(Long userId, WorkOrderSubmitDTO dto);

    void acceptWorkOrder(Long handleUserId, String handleUserName, WorkOrderAcceptDTO dto);

    void updateProgress(Long handleUserId, String handleUserName, WorkOrderProgressDTO dto);

    void handleWorkOrder(Long handleUserId, String handleUserName, WorkOrderHandleDTO dto);

    void rateWorkOrder(Long userId, WorkOrderRateDTO dto);

    void rejectWorkOrder(Long handleUserId, String handleUserName, WorkOrderRejectDTO dto);

    void closeWorkOrder(Long userId, WorkOrderRejectDTO dto);

    void urgeWorkOrder(Long userId, Long workOrderId);

    Page<WorkOrder> getWorkOrderPage(Long userId, Integer role, Integer pageNum, Integer pageSize, Integer status, String keyword);

    List<WorkOrderLog> getWorkOrderLogs(Long workOrderId);

    WorkOrderStatsVO getStats(String startDate, String endDate);

    void checkTimeoutAndAutoComplete();
}