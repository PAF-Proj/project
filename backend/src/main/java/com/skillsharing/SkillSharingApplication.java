package com.skillsharing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;


@EnableMongoAuditing
@ComponentScan(basePackages = {"com.skillsharing"})
@EnableMongoRepositories(basePackages = "com.skillsharing.repository") // Ensure only MongoDB repositories are enabled
@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
})
public class SkillSharingApplication {
    private final RequestMappingHandlerMapping requestMappingHandlerMapping;
    private final MongoTemplate mongoTemplate;

    public SkillSharingApplication(RequestMappingHandlerMapping requestMappingHandlerMapping, MongoTemplate mongoTemplate) {
        this.requestMappingHandlerMapping = requestMappingHandlerMapping;
        this.mongoTemplate = mongoTemplate;
    }

    public static void main(String[] args) {
        SpringApplication.run(SkillSharingApplication.class, args);
    }

    @EventListener
    public void onApplicationEvent(ApplicationReadyEvent event) {
        try {
            // Try to access MongoDB by getting collection names
            mongoTemplate.getCollectionNames();
            System.out.println("\n=== Successfully connected to MongoDB ===\n");
        } catch (Exception e) {
            System.err.println("\n=== Failed to connect to MongoDB: " + e.getMessage() + " ===\n");
        }
        
        System.out.println("\n=== Mapped URLs ===\n");
        requestMappingHandlerMapping.getHandlerMethods().forEach((key, value) -> {
            System.out.println(key + " => " + value);
        });
        System.out.println("\n=== End of Mapped URLs ===\n");
    }
}
