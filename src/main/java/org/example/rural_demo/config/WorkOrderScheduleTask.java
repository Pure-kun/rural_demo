package org.example.rural_demo.config;

import org.example.rural_demo.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WorkOrderScheduleTask {

    @Autowired
    private WorkOrderService workOrderService;

    @Scheduled(cron = "0 0 * * * ?")
    public void checkTimeoutWorkOrders() {
        workOrderService.checkTimeoutAndAutoComplete();
    }
}