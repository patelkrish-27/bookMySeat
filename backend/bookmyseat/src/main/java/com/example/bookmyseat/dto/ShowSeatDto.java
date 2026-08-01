package com.example.bookmyseat.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
import com.example.bookmyseat.enums.SeatType;
import com.example.bookmyseat.enums.SeatStatus;

@Data
@Builder
public class ShowSeatDto {
    private UUID showSeatId;
    private String seatRow;
    private Integer seatNumber;
    private SeatType seatType;
    private BigDecimal price;
    private SeatStatus status;
}
