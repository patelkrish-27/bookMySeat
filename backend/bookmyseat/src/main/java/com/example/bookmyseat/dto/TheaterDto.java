package com.example.bookmyseat.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class TheaterDto {
    private UUID id;
    private String name;
    private String city;
    private String address;
}
