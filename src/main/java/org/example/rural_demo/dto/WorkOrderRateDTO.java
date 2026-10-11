package org.example.rural_demo.dto;

public class WorkOrderRateDTO {
    private Long id;
    private Integer rating;
    private String ratingContent;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getRatingContent() { return ratingContent; }
    public void setRatingContent(String ratingContent) { this.ratingContent = ratingContent; }
}