package com.example.bookmyseat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync   // enables @Async — email sending never blocks API responses
public class BookmyseatApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookmyseatApplication.class, args);
	}

}
