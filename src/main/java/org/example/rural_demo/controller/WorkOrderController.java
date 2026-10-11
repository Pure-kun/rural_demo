package org.example.rural_demo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.rural_demo.common.Result;
import org.example.rural_demo.dto.*;
import org.example.rural_demo.entity.WorkOrder;
import org.example.rural_demo.entity.WorkOrderLog;
import org.example.rural_demo.service.UserService;
import org.example.rural_demo.service.WorkOrderService;
import org.example.rural_demo.vo.WorkOrderStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workorder")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private UserService userService;

    @PostMapping("/submit")
    public Result<Void> submitWorkOrder(@RequestBody WorkOrderSubmitDTO dto,
                                        @RequestAttribute Long userId) {
        workOrderService.submitWorkOrder(userId, dto);
        return Result.success();
    }

    @PutMapping("/accept")
    public Result<Void> acceptWorkOrder(@RequestBody WorkOrderAcceptDTO dto,
                                        @RequestAttribute Long userId,
                                        @RequestAttribute Integer role) {
        if (role != 1) return Result.error(403, "仅村干部可受理工单");
        String name = userService.getUserNameById(userId);
        workOrderService.acceptWorkOrder(userId, name, dto);
        return Result.success();
    }

    @PutMapping("/progress")
    public Result<Void> updateProgress(@RequestBody WorkOrderProgressDTO dto,
                                       @RequestAttribute Long userId,
                                       @RequestAttribute Integer role) {
        if (role != 1) return Result.error(403, "仅村干部可更新进度");
        String name = userService.getUserNameById(userId);
        workOrderService.updateProgress(userId, name, dto);
        return Result.success();
    }

    @PutMapping("/handle")
    public Result<Void> handleWorkOrder(@RequestBody WorkOrderHandleDTO dto,
                                        @RequestAttribute Long userId,
                                        @RequestAttribute Integer role) {
        if (role != 1) return Result.error(403, "仅村干部可处理工单");
        String name = userService.getUserNameById(userId);
        workOrderService.handleWorkOrder(userId, name, dto);
        return Result.success();
    }

    @PutMapping("/rate")
    public Result<Void> rateWorkOrder(@RequestBody WorkOrderRateDTO dto,
                                      @RequestAttribute Long userId) {
        workOrderService.rateWorkOrder(userId, dto);
        return Result.success();
    }

    @PutMapping("/reject")
    public Result<Void> rejectWorkOrder(@RequestBody WorkOrderRejectDTO dto,
                                        @RequestAttribute Long userId,
                                        @RequestAttribute Integer role) {
        if (role != 1) return Result.error(403, "仅村干部可驳回工单");
        String name = userService.getUserNameById(userId);
        workOrderService.rejectWorkOrder(userId, name, dto);
        return Result.success();
    }

    @PutMapping("/close")
    public Result<Void> closeWorkOrder(@RequestBody WorkOrderRejectDTO dto,
                                       @RequestAttribute Long userId) {
        workOrderService.closeWorkOrder(userId, dto);
        return Result.success();
    }

    @PostMapping("/urge/{id}")
    public Result<Void> urgeWorkOrder(@PathVariable Long id,
                                      @RequestAttribute Long userId) {
        workOrderService.urgeWorkOrder(userId, id);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<WorkOrder>> getWorkOrderPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword,
            @RequestAttribute Long userId,
            @RequestAttribute Integer role) {
        Page<WorkOrder> page = workOrderService.getWorkOrderPage(userId, role, pageNum, pageSize, status, keyword);
        return Result.success(page);
    }

    @GetMapping("/logs/{id}")
    public Result<List<WorkOrderLog>> getWorkOrderLogs(@PathVariable Long id) {
        List<WorkOrderLog> logs = workOrderService.getWorkOrderLogs(id);
        return Result.success(logs);
    }

    @GetMapping("/stats")
    public Result<WorkOrderStatsVO> getStats(@RequestAttribute Integer role,
                                             @RequestParam(required = false) String startDate,
                                             @RequestParam(required = false) String endDate) {
        if (role != 1) {
            return Result.error(403, "无权限查看统计数据");
        }
        WorkOrderStatsVO stats = workOrderService.getStats(startDate, endDate);
        return Result.success(stats);
    }
}