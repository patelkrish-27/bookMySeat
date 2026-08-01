package com.example.bookmyseat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "theaters", indexes = {
    @Index(name = "idx_theaters_city", columnList = "city")
})
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(name = "total_screens", columnDefinition = "integer default 0")
    private Integer totalScreens;
}