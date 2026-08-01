package com.example.bookmyseat.controller;

import com.example.bookmyseat.dto.MovieDto;
import com.example.bookmyseat.dto.ShowDto;
import com.example.bookmyseat.dto.ShowSeatDto;
import com.example.bookmyseat.dto.TheaterDto;
import com.example.bookmyseat.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/movies")
    public ResponseEntity<List<MovieDto>> getMovies() {
        return ResponseEntity.ok(searchService.getAllMoviesPlaying());
    }

    @GetMapping("/theaters")
    public ResponseEntity<List<TheaterDto>> getTheaters(@RequestParam String city) {
        return ResponseEntity.ok(searchService.getTheatersByCity(city));
    }

    @GetMapping("/movies/{movieId}/shows")
    public ResponseEntity<List<ShowDto>> getShowsByMovie(@PathVariable UUID movieId) {
        return ResponseEntity.ok(searchService.getShowsForMovie(movieId));
    }

    @GetMapping("/shows/{showId}/seats")
    public ResponseEntity<List<ShowSeatDto>> getShowSeats(@PathVariable UUID showId) {
        return ResponseEntity.ok(searchService.getSeatingLayout(showId));
    }
}
