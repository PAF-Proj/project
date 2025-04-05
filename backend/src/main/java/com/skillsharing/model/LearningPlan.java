package com.skillsharing.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Document(collection = "learning_plans")
public class LearningPlan {

    @Id
    private String id;

    private String title;
    private String description;
    private String userId; // Changed from Long to String
    private LocalDate createdAt;

    @DBRef
    private List<LearningStep> steps = new ArrayList<>(); // Initialized to empty list
}