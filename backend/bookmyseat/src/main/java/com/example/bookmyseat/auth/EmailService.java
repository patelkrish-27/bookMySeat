package com.example.bookmyseat.auth;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Central email-sending service.
 *
 * All public methods are annotated {@code @Async} — they submit work to the
 * async executor and return immediately, so no API response is ever blocked
 * waiting for SMTP.
 *
 * Plain-text OTP emails use {@link SimpleMailMessage} (lighter-weight).
 * The booking-confirmation ticket uses {@link MimeMessage} + Thymeleaf so we
 * can render a fully styled HTML email.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    // ── OTP verification email ────────────────────────────────────────────────

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("BookMySeat — Verify your email");
            message.setText(
                    "Your verification code is: " + otp + "\n\n" +
                    "This code expires in 10 minutes.\n" +
                    "If you didn't request this, you can safely ignore this email."
            );
            mailSender.send(message);
            log.debug("OTP email sent to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send OTP email to {}: {}", toEmail, ex.getMessage());
        }
    }

    // ── Booking confirmation email ────────────────────────────────────────────

    /**
     * Sends a styled HTML movie-ticket confirmation email using the
     * {@code booking-confirmation.html} Thymeleaf template.
     *
     * @param toEmail        Recipient address
     * @param userName       Recipient's display name
     * @param bookingId      Full UUID string — last 8 chars used as short ID
     * @param movieTitle     Title of the booked movie
     * @param posterUrl      Public URL of the movie poster (may be null)
     * @param theaterName    Name of the cinema
     * @param theaterCity    City where the cinema is located
     * @param theaterAddress Full address of the cinema
     * @param screenName     Screen name inside the theater
     * @param showDate       Formatted show date, e.g. "Sat, 2 Aug 2026"
     * @param showTime       Formatted show time, e.g. "03:30 PM"
     * @param seats          List of {@link SeatEmailEntry} — each has a label + seatType
     * @param totalAmount    Amount paid
     */
    public void sendBookingConfirmation(
            String toEmail,
            String userName,
            String bookingId,
            String movieTitle,
            String posterUrl,
            String theaterName,
            String theaterCity,
            String theaterAddress,
            String screenName,
            String showDate,
            String showTime,
            List<SeatEmailEntry> seats,
            BigDecimal totalAmount) {

        try {
            // Build Thymeleaf context — variable names match th:text="${...}" in the template
            Context ctx = new Context();
            ctx.setVariable("userName",      userName);
            ctx.setVariable("shortBookingId", bookingId.substring(bookingId.length() - 8).toUpperCase());
            ctx.setVariable("movieTitle",    movieTitle);
            ctx.setVariable("posterUrl",     posterUrl);
            ctx.setVariable("theaterName",   theaterName);
            ctx.setVariable("theaterCity",   theaterCity);
            ctx.setVariable("theaterAddress", theaterAddress);
            ctx.setVariable("screenName",    screenName);
            ctx.setVariable("showDate",      showDate);
            ctx.setVariable("showTime",      showTime);
            ctx.setVariable("seatCount",     seats.size());
            ctx.setVariable("seats",         seats);
            ctx.setVariable("totalAmount",
                    String.format("%.2f", totalAmount));

            String html = templateEngine.process("booking-confirmation", ctx);

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("🎬 Booking Confirmed — " + movieTitle + " | BookMySeat");
            helper.setText(html, true); // true = isHtml

            mailSender.send(mime);
            log.info("Booking confirmation email sent to {} for booking {}", toEmail, bookingId);

        } catch (Exception ex) {
            // Email failure must NEVER roll back the payment — log and swallow.
            log.error("Failed to send booking confirmation email to {} (booking {}): {}",
                    toEmail, bookingId, ex.getMessage());
        }
    }

    // ── Inner DTO used to pass seat data into the template ────────────────────

    /**
     * Minimal projection of a seat for email rendering.
     * {@code label}    → e.g. "A1", "B12"
     * {@code seatType} → "REGULAR" | "PREMIUM" | "RECLINER"  (drives CSS class in template)
     */
    public record SeatEmailEntry(String label, String seatType) {}
}
