package com.example.bookmyseat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",  // Vite dev server (default)
                    "http://localhost:3000",  // CRA / alternate dev port
                    "http://localhost:4173",  // Vite preview
                    "http://localhost:8443",  // any other local origin
                    "https://bookmyseat-krabe2lh5-patelkrish-27s-projects.vercel.app", // Vercel deployment 1
                    "https://bookmyseat-flax.vercel.app" // Vercel deployment 2
                )
                // Auth uses Bearer tokens (Authorization header), NOT cookies.
                // allowCredentials(true) is for cookie-based auth and conflicts
                // with wildcard header rules — keep it false.
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
