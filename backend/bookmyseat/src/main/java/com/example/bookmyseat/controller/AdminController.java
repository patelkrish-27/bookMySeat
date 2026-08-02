package com.example.bookmyseat.controller;

import com.example.bookmyseat.dto.AdminDtos.*;
import com.example.bookmyseat.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST endpoints for admin operations — creating/editing movies, theaters,
 * screens, seat layouts, and shows.
 *
 * All endpoints require ROLE_ADMIN (enforced by SecurityConfig on
 * "/api/v1/admin/**").
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── MOVIE ───────────────────────────────────────────────────────────────────

    @GetMapping("/movies")
    public ResponseEntity<List<MovieResponse>> getAllMovies() {
        return ResponseEntity.ok(adminService.getAllMovies());
    }

    @GetMapping("/movies/{id}")
    public ResponseEntity<MovieResponse> getMovie(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getMovie(id));
    }

    @PostMapping("/movies")
    public ResponseEntity<MovieResponse> createMovie(@RequestBody MovieCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createMovie(req));
    }

    @PutMapping("/movies/{id}")
    public ResponseEntity<MovieResponse> updateMovie(
            @PathVariable UUID id, @RequestBody MovieUpdateRequest req) {
        return ResponseEntity.ok(adminService.updateMovie(id, req));
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable UUID id) {
        adminService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    // ── THEATER ─────────────────────────────────────────────────────────────────

    @GetMapping("/theaters")
    public ResponseEntity<List<TheaterResponse>> getAllTheaters() {
        return ResponseEntity.ok(adminService.getAllTheaters());
    }

    @GetMapping("/theaters/{id}")
    public ResponseEntity<TheaterResponse> getTheater(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getTheater(id));
    }

    @PostMapping("/theaters")
    public ResponseEntity<TheaterResponse> createTheater(@RequestBody TheaterCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createTheater(req));
    }

    @PutMapping("/theaters/{id}")
    public ResponseEntity<TheaterResponse> updateTheater(
            @PathVariable UUID id, @RequestBody TheaterUpdateRequest req) {
        return ResponseEntity.ok(adminService.updateTheater(id, req));
    }

    @DeleteMapping("/theaters/{id}")
    public ResponseEntity<Void> deleteTheater(@PathVariable UUID id) {
        adminService.deleteTheater(id);
        return ResponseEntity.noContent().build();
    }

    // ── SCREEN ──────────────────────────────────────────────────────────────────

    @GetMapping("/screens")
    public ResponseEntity<List<ScreenResponse>> getAllScreens() {
        return ResponseEntity.ok(adminService.getAllScreens());
    }

    @GetMapping("/theaters/{theaterId}/screens")
    public ResponseEntity<List<ScreenResponse>> getScreensForTheater(@PathVariable UUID theaterId) {
        return ResponseEntity.ok(adminService.getScreensForTheater(theaterId));
    }

    @GetMapping("/screens/{id}")
    public ResponseEntity<ScreenResponse> getScreen(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getScreen(id));
    }

    @PostMapping("/screens")
    public ResponseEntity<ScreenResponse> createScreen(@RequestBody ScreenCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createScreen(req));
    }

    @PutMapping("/screens/{id}")
    public ResponseEntity<ScreenResponse> updateScreen(
            @PathVariable UUID id, @RequestBody ScreenUpdateRequest req) {
        return ResponseEntity.ok(adminService.updateScreen(id, req));
    }

    @DeleteMapping("/screens/{id}")
    public ResponseEntity<Void> deleteScreen(@PathVariable UUID id) {
        adminService.deleteScreen(id);
        return ResponseEntity.noContent().build();
    }

    // ── SHOW ───────────────────────────────────────────────────────────────────

    @GetMapping("/shows")
    public ResponseEntity<List<ShowResponse>> getAllShows() {
        return ResponseEntity.ok(adminService.getAllShows());
    }

    @GetMapping("/shows/{id}")
    public ResponseEntity<ShowResponse> getShow(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getShow(id));
    }

    @GetMapping("/shows/{id}/seats")
    public ResponseEntity<List<ShowSeatAdminResponse>> getShowSeats(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getShowSeats(id));
    }

    @PostMapping("/shows")
    public ResponseEntity<ShowResponse> createShow(@RequestBody ShowCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createShow(req));
    }

    @PutMapping("/shows/{id}")
    public ResponseEntity<ShowResponse> updateShow(
            @PathVariable UUID id, @RequestBody ShowUpdateRequest req) {
        return ResponseEntity.ok(adminService.updateShow(id, req));
    }

    @DeleteMapping("/shows/{id}")
    public ResponseEntity<Void> deleteShow(@PathVariable UUID id) {
        adminService.deleteShow(id);
        return ResponseEntity.noContent().build();
    }
}
