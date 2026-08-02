package com.example.bookmyseat.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class MovieDto {
    private UUID id;
    private String title;
    private String description;
    private Integer durationMins;
    private String language;
    private LocalDate releaseDate;
    private String posterUrl;
    private String backdropUrl;
}
