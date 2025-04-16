package com.skillsharing.repository;

import com.skillsharing.model.LearningStep;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningStepRepository extends MongoRepository<LearningStep, String> {
    List<LearningStep> findByLearningPlanId(String planId);
    
    @Query(value = "{'learningPlan.$id': ?0}", count = true)
    long countByLearningPlanId(String planId);
    
    @Query(value = "{'learningPlan.$id': ?0, 'completed': true}", count = true)
    long countCompletedStepsByPlanId(String planId);


}
