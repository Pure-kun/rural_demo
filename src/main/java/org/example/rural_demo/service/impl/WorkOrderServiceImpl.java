package org.example.rural_demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.example.rural_demo.common.BusinessException;
import org.example.rural_demo.common.WorkOrderStatus;
import org.example.rural_demo.dto.*;
import org.example.rural_demo.entity.WorkOrder;
import org.example.rural_demo.entity.WorkOrderLog;
import org.example.rural_demo.mapper.WorkOrderLogMapper;
import org.example.rural_demo.mapper.WorkOrderMapper;
import org.example.rural_demo.service.WorkOrderService;
import org.example.rural_demo.vo.WorkOrderStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class WorkOrderServiceImpl extends ServiceImpl<WorkOrderMapper, WorkOrder> implements WorkOrderService {

    @Autowired
    private WorkOrderLogMapper workOrderLogMapper;

    @Override
    @Transactional
    public void submitWorkOrder(Long userId, WorkOrderSubmitDTO dto) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setUserId(userId);
        workOrder.setTitle(dto.getTitle());
        workOrder.setContent(dto.getContent());
        workOrder.setStatus(WorkOrderStatus.PENDING.getCode());
        workOrder.setUrgeCount(0);
        LocalDateTime now = LocalDateTime.now();
        workOrder.setCreateTime(now);
        workOrder.setUpdateTime(now);
        this.save(workOrder);

        addLog(workOrder.getId(), null, WorkOrderStatus.PENDING.getCode(), userId, null, "提交工单");
    }

    @Override
    @Transactional
    public void acceptWorkOrder(Long handleUserId, String handleUserName, WorkOrderAcceptDTO dto) {
        WorkOrder workOrder = this.getById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != WorkOrderStatus.PENDING.getCode()) {
            throw new BusinessException("只有待处理的工单才能受理");
        }

        LambdaUpdateWrapper<WorkOrder> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(WorkOrder::getId, workOrder.getId())
                .eq(WorkOrder::getStatus, WorkOrderStatus.PENDING.getCode())
                .set(WorkOrder::getStatus, WorkOrderStatus.ACCEPTED.getCode())
                .set(WorkOrder::getHandleUserId, handleUserId)
                .set(WorkOrder::getAcceptTime, LocalDateTime.now())
                .set(WorkOrder::getDeadline, LocalDateTime.now().plusHours(72))
                .set(WorkOrder::getUpdateTime, LocalDateTime.now());
        boolean updated = this.update(updateWrapper);
        if (!updated) {
            throw new BusinessException("工单已被其他人受理");
        }

        addLog(workOrder.getId(), WorkOrderStatus.PENDING.getCode(), WorkOrderStatus.ACCEPTED.getCode(),
                handleUserId, handleUserName, "受理认领工单");
    }

    @Override
    @Transactional
    public void updateProgress(Long handleUserId, String handleUserName, WorkOrderProgressDTO dto) {
        WorkOrder workOrder = this.getById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != WorkOrderStatus.ACCEPTED.getCode()) {
            throw new BusinessException("只有已受理的工单才能更新进度");
        }

        addLog(workOrder.getId(), WorkOrderStatus.ACCEPTED.getCode(), WorkOrderStatus.ACCEPTED.getCode(),
                handleUserId, handleUserName, "更新进度：" + dto.getRemark());
    }

    @Override
    @Transactional
    public void handleWorkOrder(Long handleUserId, String handleUserName, WorkOrderHandleDTO dto) {
        WorkOrder workOrder = this.getById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != WorkOrderStatus.ACCEPTED.getCode()) {
            throw new BusinessException("只有已受理的工单才能完成处理");
        }

        workOrder.setStatus(WorkOrderStatus.COMPLETED.getCode());
        workOrder.setResult(dto.getResult());
        workOrder.setFinishTime(LocalDateTime.now());
        workOrder.setUpdateTime(LocalDateTime.now());
        this.updateById(workOrder);

        addLog(workOrder.getId(), WorkOrderStatus.ACCEPTED.getCode(), WorkOrderStatus.COMPLETED.getCode(),
                handleUserId, handleUserName, "处理完成：" + dto.getResult());
    }

    @Override
    @Transactional
    public void rateWorkOrder(Long userId, WorkOrderRateDTO dto) {
        WorkOrder workOrder = this.getById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!workOrder.getUserId().equals(userId)) {
            throw new BusinessException("只能评价自己提交的工单");
        }
        if (workOrder.getStatus() != WorkOrderStatus.COMPLETED.getCode()) {
            throw new BusinessException("只有已完成的工单才能评价");
        }
        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BusinessException("评分必须在1-5之间");
        }

        workOrder.setStatus(WorkOrderStatus.RATED.getCode());
        workOrder.setRating(dto.getRating());
        workOrder.setRatingContent(dto.getRatingContent());
        workOrder.setRatingTime(LocalDateTime.now());
        workOrder.setUpdateTime(LocalDateTime.now());
        this.updateById(workOrder);

        addLog(workOrder.getId(), WorkOrderStatus.COMPLETED.getCode(), WorkOrderStatus.RATED.getCode(),
                userId, null, "村民评价：" + dto.getRating() + "星");
    }

    @Override
    @Transactional
    public void rejectWorkOrder(Long handleUserId, String handleUserName, WorkOrderRejectDTO dto) {
        WorkOrder workOrder = this.getById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != WorkOrderStatus.ACCEPTED.getCode()) {
            throw new BusinessException("只有已受理的工单才能驳回");
        }

        workOrder.setStatus(WorkOrderStatus.REJECTED.getCode());
        workOrder.setRejectReason(dto.getRejectReason());
        workOrder.setRejectTime(LocalDateTime.now());
        workOrder.setUpdateTime(LocalDateTime.now());
        this.updateById(workOrder);

        addLog(workOrder.getId(), WorkOrderStatus.ACCEPTED.getCode(), WorkOrderStatus.REJECTED.getCode(),
                handleUserId, handleUserName, "驳回工单：" + dto.getRejectReason());
    }

    @Override
    @Transactional
    public void closeWorkOrder(Long userId, WorkOrderRejectDTO dto) {
        WorkOrder workOrder = this.getById(dto.getId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!workOrder.getUserId().equals(userId)) {
            throw new BusinessException("只能关闭自己提交的工单");
        }
        Integer status = workOrder.getStatus();
        if (status == null) {
            throw new BusinessException("工单状态异常");
        }
        if (status != WorkOrderStatus.REJECTED.getCode() && status != WorkOrderStatus.PENDING.getCode()) {
            throw new BusinessException("只有被驳回或待处理的工单才能关闭");
        }

        workOrder.setStatus(WorkOrderStatus.CLOSED.getCode());
        workOrder.setUpdateTime(LocalDateTime.now());
        this.updateById(workOrder);

        addLog(workOrder.getId(), status, WorkOrderStatus.CLOSED.getCode(),
                userId, null, "村民关闭工单");
    }

    @Override
    @Transactional
    public void urgeWorkOrder(Long userId, Long workOrderId) {
        WorkOrder workOrder = this.getById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (!workOrder.getUserId().equals(userId)) {
            throw new BusinessException("只能催办自己提交的工单");
        }
        Integer status = workOrder.getStatus();
        if (status == null) {
            throw new BusinessException("工单状态异常");
        }
        if (status != WorkOrderStatus.PENDING.getCode() && status != WorkOrderStatus.ACCEPTED.getCode()) {
            throw new BusinessException("只有待处理或已受理的工单才能催办");
        }

        if (workOrder.getLastUrgeTime() != null
                && workOrder.getLastUrgeTime().plusHours(24).isAfter(LocalDateTime.now())) {
            throw new BusinessException("24小时内只能催办1次");
        }

        int currentUrge = workOrder.getUrgeCount() != null ? workOrder.getUrgeCount() : 0;
        workOrder.setUrgeCount(currentUrge + 1);
        workOrder.setLastUrgeTime(LocalDateTime.now());
        workOrder.setUpdateTime(LocalDateTime.now());
        this.updateById(workOrder);

        addLog(workOrder.getId(), status, status, userId, null, "催办工单（第" + workOrder.getUrgeCount() + "次）");
    }

    @Override
    public Page<WorkOrder> getWorkOrderPage(Long userId, Integer role, Integer pageNum, Integer pageSize,
                                            Integer status, String keyword) {
        Page<WorkOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (role == 0) {
            wrapper.eq(WorkOrder::getUserId, userId);
        }
        if (status != null) {
            wrapper.eq(WorkOrder::getStatus, status);
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.like(WorkOrder::getTitle, keyword.trim());
        }
        wrapper.orderByDesc(WorkOrder::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public List<WorkOrderLog> getWorkOrderLogs(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderLog::getWorkOrderId, workOrderId)
                .orderByAsc(WorkOrderLog::getCreateTime);
        return workOrderLogMapper.selectList(wrapper);
    }

    @Override
    public WorkOrderStatsVO getStats(String startDate, String endDate) {
        WorkOrderStatsVO stats = new WorkOrderStatsVO();

        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(WorkOrder::getStatus, WorkOrder::getRating, WorkOrder::getUrgeCount,
                WorkOrder::getAcceptTime, WorkOrder::getFinishTime);

        if (startDate != null && !startDate.trim().isEmpty()) {
            LocalDateTime start = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
            wrapper.ge(WorkOrder::getCreateTime, start);
        }
        if (endDate != null && !endDate.trim().isEmpty()) {
            LocalDateTime end = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE).atTime(LocalTime.MAX);
            wrapper.le(WorkOrder::getCreateTime, end);
        }

        List<WorkOrder> allOrders = this.list(wrapper);
        long total = allOrders.size();
        stats.setTotalCount(total);

        long pending = 0, accepted = 0, completed = 0, rated = 0, rejected = 0, closed = 0;
        double ratingSum = 0;
        int ratingCount = 0;
        long urgedCount = 0;
        double handleTimeSum = 0;
        int handleTimeCount = 0;

        for (WorkOrder o : allOrders) {
            Integer s = o.getStatus();
            if (s == null) continue;
            if (s == WorkOrderStatus.PENDING.getCode()) pending++;
            else if (s == WorkOrderStatus.ACCEPTED.getCode()) accepted++;
            else if (s == WorkOrderStatus.COMPLETED.getCode()) completed++;
            else if (s == WorkOrderStatus.RATED.getCode()) rated++;
            else if (s == WorkOrderStatus.REJECTED.getCode()) rejected++;
            else if (s == WorkOrderStatus.CLOSED.getCode()) closed++;

            if (o.getRating() != null) {
                ratingSum += o.getRating();
                ratingCount++;
            }
            if (o.getUrgeCount() != null && o.getUrgeCount() > 0) {
                urgedCount++;
            }
            if (o.getAcceptTime() != null && o.getFinishTime() != null) {
                long hours = Duration.between(o.getAcceptTime(), o.getFinishTime()).toHours();
                handleTimeSum += hours;
                handleTimeCount++;
            }
        }

        stats.setPendingCount(pending);
        stats.setAcceptedCount(accepted);
        stats.setCompletedCount(completed);
        stats.setRatedCount(rated);
        stats.setRejectedCount(rejected);
        stats.setClosedCount(closed);
        stats.setUrgedCount(urgedCount);

        if (ratingCount > 0) {
            stats.setAvgRating(Math.round(ratingSum / ratingCount * 100.0) / 100.0);
        }
        if (total > 0) {
            long finished = completed + rated + closed;
            stats.setCompletionRate(Math.round(finished * 10000.0 / total) / 100.0);
        }
        if (handleTimeCount > 0) {
            stats.setAvgHandleHours(Math.round(handleTimeSum / handleTimeCount * 100.0) / 100.0);
        }

        return stats;
    }

    @Override
    @Transactional
    public void checkTimeoutAndAutoComplete() {
        LambdaQueryWrapper<WorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrder::getStatus, WorkOrderStatus.ACCEPTED.getCode())
                .le(WorkOrder::getDeadline, LocalDateTime.now());
        List<WorkOrder> timeoutOrders = this.list(wrapper);

        for (WorkOrder order : timeoutOrders) {
            order.setStatus(WorkOrderStatus.COMPLETED.getCode());
            order.setResult("系统自动完结（超时72小时未处理）");
            order.setFinishTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());
            this.updateById(order);

            addLog(order.getId(), WorkOrderStatus.ACCEPTED.getCode(), WorkOrderStatus.COMPLETED.getCode(),
                    null, "系统", "超时自动完结");
        }
    }

    private void addLog(Long workOrderId, Integer fromStatus, Integer toStatus,
                        Long operatorId, String operatorName, String remark) {
        WorkOrderLog log = new WorkOrderLog();
        log.setWorkOrderId(workOrderId);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setRemark(remark);
        log.setCreateTime(LocalDateTime.now());
        workOrderLogMapper.insert(log);
    }
}