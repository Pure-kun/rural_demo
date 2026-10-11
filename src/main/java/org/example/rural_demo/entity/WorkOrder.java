package org.example.rural_demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("work_order")
public class WorkOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String content;

    private Integer status;

    private Long handleUserId;

    private String result;

    private Integer rating;

    private String ratingContent;

    private LocalDateTime ratingTime;

    private String rejectReason;

    private LocalDateTime rejectTime;

    private LocalDateTime finishTime;

    private LocalDateTime acceptTime;

    private Integer urgeCount;

    private LocalDateTime lastUrgeTime;

    private LocalDateTime deadline;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public Long getHandleUserId() { return handleUserId; }
    public void setHandleUserId(Long handleUserId) { this.handleUserId = handleUserId; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getRatingContent() { return ratingContent; }
    public void setRatingContent(String ratingContent) { this.ratingContent = ratingContent; }

    public LocalDateTime getRatingTime() { return ratingTime; }
    public void setRatingTime(LocalDateTime ratingTime) { this.ratingTime = ratingTime; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public LocalDateTime getRejectTime() { return rejectTime; }
    public void setRejectTime(LocalDateTime rejectTime) { this.rejectTime = rejectTime; }

    public LocalDateTime getFinishTime() { return finishTime; }
    public void setFinishTime(LocalDateTime finishTime) { this.finishTime = finishTime; }

    public LocalDateTime getAcceptTime() { return acceptTime; }
    public void setAcceptTime(LocalDateTime acceptTime) { this.acceptTime = acceptTime; }

    public Integer getUrgeCount() { return urgeCount; }
    public void setUrgeCount(Integer urgeCount) { this.urgeCount = urgeCount; }

    public LocalDateTime getLastUrgeTime() { return lastUrgeTime; }
    public void setLastUrgeTime(LocalDateTime lastUrgeTime) { this.lastUrgeTime = lastUrgeTime; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}