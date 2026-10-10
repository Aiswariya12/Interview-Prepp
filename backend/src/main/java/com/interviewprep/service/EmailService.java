package com.interviewprep.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final HttpClient httpClient;

    @Value("${spring.mail.from:${spring.mail.username:support@interviewprep.com}}")
    private String senderEmail;

    @Value("${app.brevo.api-key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public void sendOtpEmail(String to, String otp) {
        // Log OTP in server logs immediately so admin/user can always verify even if email delivery is delayed
        logger.info("==================================================");
        logger.info("VERIFICATION OTP FOR {}: [{}]", to, otp);
        logger.info("==================================================");

        CompletableFuture.runAsync(() -> {
            boolean sent = false;

            // Strategy 1: Brevo HTTP REST API over Port 443 (Never blocked by Render free tier)
            if (brevoApiKey != null && !brevoApiKey.isBlank()) {
                sent = sendViaBrevoApi(to, otp);
            }

            // Strategy 2: Standard SMTP fallback
            if (!sent) {
                sendViaSmtp(to, otp);
            }
        });
    }

    private boolean sendViaBrevoApi(String to, String otp) {
        try {
            logger.info("Attempting to send OTP email to {} via Brevo REST API (HTTPS port 443)...", to);
            String htmlContent = buildHtmlContent(otp);

            String jsonPayload = String.format(
                    "{\"sender\":{\"name\":\"InterviewPrep Platform\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"Your Secure Verification Code\",\"htmlContent\":%s}",
                    senderEmail, to, escapeJson(htmlContent)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .timeout(Duration.ofSeconds(8))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey.trim())
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                logger.info("SUCCESS: OTP email sent successfully to {} via Brevo REST API.", to);
                return true;
            } else {
                logger.warn("Brevo REST API responded with status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            logger.warn("Failed to send OTP email via Brevo REST API: {}", e.getMessage());
        }
        return false;
    }

    private void sendViaSmtp(String to, String otp) {
        try {
            logger.info("Attempting to send OTP email to {} via SMTP...", to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "InterviewPrep Platform");
            helper.setTo(to);
            helper.setSubject("Your Secure Verification Code");
            helper.setText(buildHtmlContent(otp), true);

            mailSender.send(message);
            logger.info("SUCCESS: OTP email sent successfully to {} via SMTP", to);
        } catch (Exception e) {
            logger.error("Failed to send OTP email via SMTP to {}: {}", to, e.getMessage());
        }
    }

    private String buildHtmlContent(String otp) {
        return "<div style=\"font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2\">" +
                "<div style=\"margin:50px auto;width:70%;padding:20px 0\">" +
                "<div style=\"border-bottom:1px solid #eee\">" +
                "<a href=\"#\" style=\"font-size:1.4em;color: #4f46e5;text-decoration:none;font-weight:600\">InterviewPrep Platform</a>" +
                "</div>" +
                "<p style=\"font-size:1.1em\">Hi,</p>" +
                "<p>Thank you for registering on InterviewPrep. Use the following OTP to complete your email verification. This OTP is valid for 10 minutes.</p>" +
                "<h2 style=\"background: #4f46e5;margin: 0 auto;width: max-content;padding: 0 15px;color: #fff;border-radius: 6px;letter-spacing: 2px;\">" + otp + "</h2>" +
                "<p style=\"font-size:0.9em;\">Regards,<br />The InterviewPrep Team</p>" +
                "<hr style=\"border:none;border-top:1px solid #eee; margin-top: 40px;\" />" +
                "<div style=\"float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300\">" +
                "<p>InterviewPrep Platform</p>" +
                "<p>Empowering Students</p>" +
                "</div>" +
                "</div>" +
                "</div>";
    }

    private String escapeJson(String s) {
        if (s == null) return "\"\"";
        StringBuilder sb = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append("\"");
        return sb.toString();
    }
}
