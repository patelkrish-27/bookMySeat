package com.example.bookmyseat.service;

import com.example.bookmyseat.dto.MovieDto;
import com.example.bookmyseat.dto.ShowDto;
import com.example.bookmyseat.dto.ShowSeatDto;
import com.example.bookmyseat.dto.TheaterDto;
import com.example.bookmyseat.repository.MovieRepository;
import com.example.bookmyseat.repository.ShowRepository;
import com.example.bookmyseat.repository.ShowSeatRepository;
import com.example.bookmyseat.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;

    public List<MovieDto> getAllMoviesPlaying() {
        return movieRepository.findAll().stream().map(movie -> MovieDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .durationMins(movie.getDurationMins())
                .language(movie.getLanguage())
                .posterUrl(movie.getPosterUrl())
                .backdropUrl(movie.getBackdropUrl())
                .build()).collect(Collectors.toList());
    }

    public List<TheaterDto> getTheatersByCity(String city) {
        return theaterRepository.findByCity(city).stream().map(theater -> TheaterDto.builder()
                .id(theater.getId())
                .name(theater.getName())
                .city(theater.getCity())
                .address(theater.getAddress())
                .build()).collect(Collectors.toList());
    }

    public List<ShowDto> getShowsForMovie(UUID movieId) {
        return showRepository.findByMovieId(movieId).stream().map(show -> ShowDto.builder()
                .id(show.getId())
                .movieId(show.getMovie().getId())
                .movieTitle(show.getMovie().getTitle())
                .theaterId(show.getScreen().getTheater().getId())
                .theaterName(show.getScreen().getTheater().getName())
                .screenName(show.getScreen().getName())
                .startTime(show.getStartTime())
                .endTime(show.getEndTime())
                .build()).collect(Collectors.toList());
    }

    public List<ShowSeatDto> getSeatingLayout(UUID showId) {
        return showSeatRepository.findByShowId(showId).stream().map(showSeat -> ShowSeatDto.builder()
                .showSeatId(showSeat.getId())
                .seatRow(showSeat.getSeat().getSeatRow())
                .seatNumber(showSeat.getSeat().getSeatNumber())
                .seatType(showSeat.getSeat().getSeatType())
                .price(showSeat.getPrice())
                .status(showSeat.getStatus())
                .build()).collect(Collectors.toList());
    }
}
