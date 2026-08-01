package com.bookmyseat.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("BookMySeat - Verify your email");
        message.setText(
                "Your verification code is: " + otp + "\n\n" +
                "This code expires in 10 minutes. If you didn't request this, ignore this email."
        );
        mailSender.send(message);
    }
}
