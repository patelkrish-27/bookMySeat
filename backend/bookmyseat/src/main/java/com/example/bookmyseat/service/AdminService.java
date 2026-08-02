package com.example.bookmyseat.service;

import com.example.bookmyseat.dto.AdminDtos.*;
import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.BookingStatus;
import com.example.bookmyseat.enums.SeatStatus;
import com.example.bookmyseat.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final ScreenRepository screenRepository;
    private final SeatRepository seatRepository;
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final BookingRepository bookingRepository;

    // ── MOVIE ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(this::toMovieResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovie(UUID id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + id));
        return toMovieResponse(movie);
    }

    @Transactional
    public MovieResponse createMovie(MovieCreateRequest req) {
        Movie movie = Movie.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .durationMins(req.getDurationMins())
                .language(req.getLanguage())
                .releaseDate(req.getReleaseDate())
                .posterUrl(req.getPosterUrl())
                .backdropUrl(req.getBackdropUrl())
                .build();
        movie = movieRepository.save(movie);
        return toMovieResponse(movie);
    }

    @Transactional
    public MovieResponse updateMovie(UUID id, MovieUpdateRequest req) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + id));
        movie.setTitle(req.getTitle());
        movie.setDescription(req.getDescription());
        movie.setDurationMins(req.getDurationMins());
        movie.setLanguage(req.getLanguage());
        movie.setReleaseDate(req.getReleaseDate());
        movie.setPosterUrl(req.getPosterUrl());
        movie.setBackdropUrl(req.getBackdropUrl());
        movieRepository.save(movie);
        return toMovieResponse(movie);
    }

    @Transactional
    public void deleteMovie(UUID id) {
        movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + id));
        if (!showRepository.findByMovieId(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot delete movie — it is used by one or more shows");
        }
        movieRepository.deleteById(id);
    }

    private MovieResponse toMovieResponse(Movie m) {
        return MovieResponse.builder()
                .id(m.getId())
                .title(m.getTitle())
                .description(m.getDescription())
                .durationMins(m.getDurationMins())
                .language(m.getLanguage())
                .releaseDate(m.getReleaseDate())
                .posterUrl(m.getPosterUrl())
                .backdropUrl(m.getBackdropUrl())
                .build();
    }

    // ── THEATER ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TheaterResponse> getAllTheaters() {
        return theaterRepository.findAll().stream()
                .map(this::toTheaterResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TheaterResponse getTheater(UUID id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + id));
        return toTheaterResponse(theater);
    }

    @Transactional
    public TheaterResponse createTheater(TheaterCreateRequest req) {
        Theater theater = Theater.builder()
                .name(req.getName())
                .city(req.getCity())
                .address(req.getAddress())
                // totalScreens starts at 0; it's incremented automatically when screens are added
                .totalScreens(0)
                .build();
        theater = theaterRepository.save(theater);
        return toTheaterResponse(theater);
    }

    @Transactional
    public TheaterResponse updateTheater(UUID id, TheaterUpdateRequest req) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + id));
        theater.setName(req.getName());
        theater.setCity(req.getCity());
        theater.setAddress(req.getAddress());
        // Note: totalScreens is derived and managed automatically; not updated here
        theaterRepository.save(theater);
        return toTheaterResponse(theater);
    }

    @Transactional
    public void deleteTheater(UUID id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + id));
        if (!screenRepository.findByTheaterId(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot delete theater — it has one or more screens. Delete all screens first.");
        }
        theaterRepository.delete(theater);
    }

    private TheaterResponse toTheaterResponse(Theater t) {
        return TheaterResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .city(t.getCity())
                .address(t.getAddress())
                .totalScreens(t.getTotalScreens())
                .build();
    }

    // ── SCREEN (with seat layout) ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ScreenResponse> getScreensForTheater(UUID theaterId) {
        return screenRepository.findByTheaterId(theaterId).stream()
                .map(this::toScreenResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScreenResponse> getAllScreens() {
        return screenRepository.findAll().stream()
                .map(this::toScreenResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScreenResponse getScreen(UUID id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Screen not found: " + id));
        return toScreenResponse(screen);
    }

    @Transactional
    public ScreenResponse createScreen(ScreenCreateRequest req) {
        Theater theater = theaterRepository.findById(req.getTheaterId())
                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + req.getTheaterId()));

        if (req.getSeats() == null || req.getSeats().isEmpty()) {
            throw new IllegalArgumentException("Screen must have at least one seat");
        }

        Screen screen = Screen.builder()
                .theater(theater)
                .name(req.getName())
                .totalSeats(req.getSeats().size())
                .build();
        screen = screenRepository.save(screen);
        final Screen savedScreen = screen;

        List<Seat> seats = req.getSeats().stream()
                .map(entry -> Seat.builder()
                        .screen(savedScreen)
                        .seatRow(entry.getSeatRow())
                        .seatNumber(entry.getSeatNumber())
                        .seatType(entry.getSeatType())
                        .build())
                .toList();
        seatRepository.saveAll(seats);

        // Increment the theater's screen count to keep it in sync
        theater.setTotalScreens(theater.getTotalScreens() + 1);
        theaterRepository.save(theater);

        return toScreenResponse(savedScreen);
    }

    @Transactional
    public ScreenResponse updateScreen(UUID id, ScreenUpdateRequest req) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Screen not found: " + id));
        screen.setName(req.getName());
        screenRepository.save(screen);
        return toScreenResponse(screen);
    }

    @Transactional
    public void deleteScreen(UUID id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Screen not found: " + id));
        if (!showRepository.findByScreenId(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot delete screen — it has one or more shows. Delete all shows first.");
        }

        // Delete all seats for this screen (safe — no active shows exist at this point)
        seatRepository.findByScreenId(id).forEach(seatRepository::delete);

        // Decrement the parent theater's screen count
        Theater theater = screen.getTheater();
        int updatedCount = Math.max(0, theater.getTotalScreens() - 1);
        theater.setTotalScreens(updatedCount);
        theaterRepository.save(theater);

        screenRepository.delete(screen);
    }

    private ScreenResponse toScreenResponse(Screen screen) {
        // Force-load theater (may be lazy proxy)
        Theater theater = screen.getTheater();
        List<Seat> seats = seatRepository.findByScreenId(screen.getId());
        List<SeatMapEntry> seatMap = seats.stream()
                .map(s -> {
                    SeatMapEntry entry = new SeatMapEntry();
                    entry.setSeatRow(s.getSeatRow());
                    entry.setSeatNumber(s.getSeatNumber());
                    entry.setSeatType(s.getSeatType());
                    return entry;
                })
                .toList();

        return ScreenResponse.builder()
                .id(screen.getId())
                .theaterId(theater.getId())
                .theaterName(theater.getName())
                .name(screen.getName())
                .totalSeats(screen.getTotalSeats())
                .seats(seatMap)
                .build();
    }

    // ── SHOW (auto-generates ShowSeats) ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ShowResponse> getAllShows() {
        return showRepository.findAll().stream()
                .map(this::toShowResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ShowResponse getShow(UUID id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Show not found: " + id));
        return toShowResponse(show);
    }

    @Transactional
    public ShowResponse createShow(ShowCreateRequest req) {
        Movie movie = movieRepository.findById(req.getMovieId())
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + req.getMovieId()));
        Screen screen = screenRepository.findById(req.getScreenId())
                .orElseThrow(() -> new IllegalArgumentException("Screen not found: " + req.getScreenId()));

        List<Seat> seats = seatRepository.findByScreenId(screen.getId());
        if (seats.isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot create show — screen has no seats defined");
        }

        Show show = Show.builder()
                .movie(movie)
                .screen(screen)
                .startTime(req.getStartTime())
                .endTime(req.getStartTime().plusMinutes(movie.getDurationMins()))
                .build();
        show = showRepository.save(show);
        final Show savedShow = show;

        // Auto-generate ShowSeats for every physical seat in the screen
        List<ShowSeat> showSeats = seats.stream()
                .map(seat -> ShowSeat.builder()
                        .show(savedShow)
                        .seat(seat)
                        .price(SeatPricing.priceFor(seat.getSeatType()))
                        .status(SeatStatus.AVAILABLE)
                        .build())
                .toList();
        showSeatRepository.saveAll(showSeats);

        return toShowResponse(savedShow);
    }

    @Transactional
    public ShowResponse updateShow(UUID id, ShowUpdateRequest req) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Show not found: " + id));

        // Reject modification if any active (non-cancelled) bookings exist
        boolean hasBookings = bookingRepository.findByShowId(id).stream()
                .anyMatch(b -> b.getStatus() != BookingStatus.CANCELLED);
        if (hasBookings) {
            throw new IllegalArgumentException(
                    "Cannot modify show — it has active bookings");
        }

        Movie movie = movieRepository.findById(req.getMovieId())
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + req.getMovieId()));
        Screen screen = screenRepository.findById(req.getScreenId())
                .orElseThrow(() -> new IllegalArgumentException("Screen not found: " + req.getScreenId()));

        boolean screenChanged = !show.getScreen().getId().equals(req.getScreenId());

        show.setMovie(movie);
        show.setScreen(screen);
        show.setStartTime(req.getStartTime());
        show.setEndTime(req.getStartTime().plusMinutes(movie.getDurationMins()));

        // Re-generate ShowSeats if the screen changed
        if (screenChanged) {
            showSeatRepository.deleteAllByShow_Id(id);
            List<Seat> seats = seatRepository.findByScreenId(req.getScreenId());
            List<ShowSeat> showSeats = seats.stream()
                    .map(seat -> ShowSeat.builder()
                            .show(show)
                            .seat(seat)
                            .price(SeatPricing.priceFor(seat.getSeatType()))
                            .status(SeatStatus.AVAILABLE)
                            .build())
                    .toList();
            showSeatRepository.saveAll(showSeats);
        }

        showRepository.save(show);
        return toShowResponse(show);
    }

    @Transactional
    public void deleteShow(UUID id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Show not found: " + id));
        boolean hasActiveBookings = bookingRepository.findByShowId(id).stream()
                .anyMatch(b -> b.getStatus() != BookingStatus.CANCELLED);
        if (hasActiveBookings) {
            throw new IllegalArgumentException(
                    "Cannot delete show — it has active bookings");
        }
        showSeatRepository.deleteAllByShow_Id(id);
        showRepository.delete(show);
    }

    // ── SHOW SEAT LIST ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ShowSeatAdminResponse> getShowSeats(UUID showId) {
        return showSeatRepository.findByShowId(showId).stream()
                .map(this::toShowSeatAdminResponse)
                .toList();
    }

    private ShowSeatAdminResponse toShowSeatAdminResponse(ShowSeat ss) {
        return ShowSeatAdminResponse.builder()
                .showSeatId(ss.getId())
                .seatId(ss.getSeat().getId())
                .seatRow(ss.getSeat().getSeatRow())
                .seatNumber(ss.getSeat().getSeatNumber())
                .seatType(ss.getSeat().getSeatType())
                .price(ss.getPrice())
                .status(ss.getStatus().name())
                .build();
    }

    private ShowResponse toShowResponse(Show show) {
        Movie movie = show.getMovie();
        Screen screen = show.getScreen();
        Theater theater = screen.getTheater();

        return ShowResponse.builder()
                .id(show.getId())
                .movieId(movie.getId())
                .movieTitle(movie.getTitle())
                .screenId(screen.getId())
                .screenName(screen.getName())
                .theaterId(theater.getId())
                .theaterName(theater.getName())
                .startTime(show.getStartTime())
                .endTime(show.getEndTime())
                .build();
    }
}
