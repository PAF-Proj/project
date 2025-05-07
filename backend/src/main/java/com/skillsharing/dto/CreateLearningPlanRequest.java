package com.skillsharing.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CreateLearningPlanRequest {
    private String title;
    private String description;
    private String userId;
}