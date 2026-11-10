package com.example.talentpool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Satu thread: pengiriman email lowongan diproses berurutan agar SMTP tidak dibanjiri
     * dan dua lowongan yang dipublikasikan bersamaan tidak saling menimpa laju kirim.
     */
    @Bean(name = "jobAlertExecutor")
    public Executor jobAlertExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(1);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("job-alert-");
        executor.initialize();
        return executor;
    }
}
