package com.skillsharing.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Getter
@Setter
@Document(collection = "learning_steps")
public class LearningStep {

    @Id
    private String id;

    private String title;
    private String content;
    private boolean completed;

    @DBRef
    private LearningPlan learningPlan;
}
