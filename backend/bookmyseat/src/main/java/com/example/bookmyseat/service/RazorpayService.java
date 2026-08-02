package com.example.bookmyseat.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Thin wrapper around the Razorpay Java SDK.
 *
 * INTERVIEW NOTE: verifySignature() is the critical security boundary.
 * The frontend callback says "payment succeeded" but that's untrusted client
 * data. Only Utils.verifyPaymentSignature() — using our key-secret server-side —
 * cryptographically proves the response is genuine and wasn't tampered with.
 */
@Service
public class RazorpayService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient client() throws RazorpayException {
        return new RazorpayClient(keyId, keySecret);
    }

    public String getPublicKeyId() {
        return keyId;
    }

    /**
     * Creates a Razorpay Order.
     *
     * @param amountInPaise  amount in the smallest currency unit (₹250 → 25000)
     * @param currency        e.g. "INR"
     * @param receipt         your internal reference — we use the bookingId string
     * @return Razorpay order ID (e.g. "order_Abc123...")
     */
    public String createOrder(long amountInPaise, String currency, String receipt) {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1); // auto-capture on success

            com.razorpay.Order order = client().orders.create(orderRequest);
            return order.get("id");
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies the HMAC-SHA256 signature on the payment response.
     * Returns true only if the signature is valid; false on any failure.
     */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);
            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }
}
