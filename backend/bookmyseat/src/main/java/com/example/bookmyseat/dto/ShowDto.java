package com.example.bookmyseat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShowDto {
    private UUID id;
    private UUID movieId;
    private String movieTitle;
    private UUID theaterId;
    private String theaterName;
    private String screenName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
