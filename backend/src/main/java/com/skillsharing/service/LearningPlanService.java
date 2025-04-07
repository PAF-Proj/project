package com.skillsharing.service;

import com.skillsharing.dto.CreateLearningPlanRequest;
import com.skillsharing.dto.AddStepRequest;
import com.skillsharing.dto.UpdateStepStatusRequest;
import com.skillsharing.model.LearningPlan;
import com.skillsharing.model.LearningStep;
import com.skillsharing.repository.LearningPlanRepository;
import com.skillsharing.repository.LearningStepRepository;
import com.skillsharing.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningPlanService {
    private final LearningPlanRepository learningPlanRepository;
    private final LearningStepRepository learningStepRepository;

    public LearningPlan createPlan(CreateLearningPlanRequest request, String userId) {
        // Validate input
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Plan title is required");
        }
        if (request.getTitle().length() > 100) {
            throw new IllegalArgumentException("Plan title cannot exceed 100 characters");
        }
        if (request.getDescription() != null && request.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Plan description cannot exceed 1000 characters");
        }

        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.getTitle().trim());
        plan.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        plan.setUserId(userId); // No need for Long.valueOf
        plan.setCreatedAt(LocalDate.now());
        return learningPlanRepository.save(plan);
    }
}