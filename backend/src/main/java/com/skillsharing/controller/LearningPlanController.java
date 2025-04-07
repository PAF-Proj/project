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

}