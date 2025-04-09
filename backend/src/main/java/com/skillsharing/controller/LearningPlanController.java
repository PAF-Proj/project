package com.skillsharing.controller;

import com.skillsharing.dto.CreateLearningPlanRequest;
import com.skillsharing.dto.AddStepRequest;
import com.skillsharing.dto.UpdateStepStatusRequest;
import com.skillsharing.model.LearningPlan;
import com.skillsharing.model.LearningStep;
import com.skillsharing.service.LearningPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plans")
@RequiredArgsConstructor
public class LearningPlanController {
    private final LearningPlanService learningPlanService;

    @PostMapping
    public ResponseEntity<LearningPlan> createPlan(
            @RequestBody CreateLearningPlanRequest request,
            Authentication authentication) {
        String userId = authentication.getName(); // Extract userId from JWT
        LearningPlan plan = learningPlanService.createPlan(request, userId);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/{planId}")
    public ResponseEntity<LearningPlan> getPlanById(@PathVariable String planId) {
        LearningPlan plan = learningPlanService.getPlanById(planId);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/my-plans")
    public ResponseEntity<List<LearningPlan>> getMyPlans(Authentication authentication) {
        String userId = authentication.getName();
        List<LearningPlan> plans = learningPlanService.getPlansByUser(userId);
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/{planId}/steps")
    public ResponseEntity<LearningStep> addStep(
            @PathVariable String planId,
            @RequestBody AddStepRequest request) {
        LearningStep step = learningPlanService.addStepToPlan(planId, request);
        return ResponseEntity.ok(step);
    }

    @PatchMapping("/steps/{stepId}")
    public ResponseEntity<LearningStep> updateStepStatus(
            @PathVariable String stepId,
            @RequestBody UpdateStepStatusRequest request) {
        LearningStep step = learningPlanService.updateStepStatus(stepId, request);
        return ResponseEntity.ok(step);
    }

    @GetMapping("/{planId}/progress")
    public ResponseEntity<Double> getPlanProgress(@PathVariable String planId) {
        double progress = learningPlanService.calculateProgress(planId);
        return ResponseEntity.ok(progress);
    }



    @GetMapping("/{planId}/steps")
    public ResponseEntity<List<LearningStep>> getStepsByPlanId(@PathVariable String planId) {
        List<LearningStep> steps = learningPlanService.getStepsByPlanId(planId);
        return ResponseEntity.ok(steps);
    }



    /// /
    @PutMapping("/{planId}")
    public ResponseEntity<LearningPlan> updatePlan(
            @PathVariable String planId,
            @RequestBody CreateLearningPlanRequest request) {
        LearningPlan updatedPlan = learningPlanService.updatePlan(planId, request);
        return ResponseEntity.ok(updatedPlan);
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable String planId) {
        learningPlanService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/steps/{stepId}")
    public ResponseEntity<LearningStep> updateStep(
            @PathVariable String stepId,
            @RequestBody AddStepRequest request) {
        LearningStep updatedStep = learningPlanService.updateStep(stepId, request);
        return ResponseEntity.ok(updatedStep);
    }


    @DeleteMapping("/steps/{stepId}")
    public ResponseEntity<Void> deleteStep(@PathVariable String stepId) {
        learningPlanService.deleteStep(stepId);
        return ResponseEntity.noContent().build();
    }





}