package org.example.rural_demo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("org.example.rural_demo.mapper")
@EnableScheduling
public class RuralDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(RuralDemoApplication.class, args);
    }

}