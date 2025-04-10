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

    public LearningPlan getPlanById(String planId) {
        return learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + planId));
    }

    public LearningStep getStepById(String stepId) {
        return learningStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Step not found with id: " + stepId));
    }

    public LearningStep addStepToPlan(String planId, AddStepRequest request) {
        // Validate input
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Step title is required");
        }
        if (request.getTitle().length() > 100) {
            throw new IllegalArgumentException("Step title cannot exceed 100 characters");
        }
        if (request.getContent() != null && request.getContent().length() > 1000) {
            throw new IllegalArgumentException("Step content cannot exceed 1000 characters");
        }

        LearningPlan plan = getPlanById(planId);

        LearningStep step = new LearningStep();
        step.setTitle(request.getTitle().trim());
        step.setContent(request.getContent() != null ? request.getContent().trim() : "");
        step.setCompleted(false);
        step.setLearningPlan(plan);

        return learningStepRepository.save(step);
    }

    public LearningStep updateStepStatus(String stepId, UpdateStepStatusRequest request) {
        LearningStep step = getStepById(stepId);
        step.setCompleted(request.isCompleted());
        return learningStepRepository.save(step);
    }

    public List<LearningPlan> getPlansByUser(String userId) {
        return learningPlanRepository.findByUserId(userId);
    }

    public double calculateProgress(String planId) {
        List<LearningStep> steps = learningStepRepository.findByLearningPlanId(planId);

        if (steps.isEmpty()) {
            return 0.0;
        }

        long completedSteps = steps.stream()
                .filter(LearningStep::isCompleted)
                .count();

        return ((double) completedSteps / steps.size()) * 100.0;
    }



    public List<LearningStep> getStepsByPlanId(String planId) {
        // Ensure the plan exists before fetching steps
        getPlanById(planId);
        return learningStepRepository.findByLearningPlanId(planId);
    }
}