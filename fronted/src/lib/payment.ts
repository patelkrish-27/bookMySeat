/**
 * payment.ts — Razorpay Checkout integration helper.
 *
 * Flow:
 *  1. Call /api/v1/payments/create-order to get a Razorpay order.
 *  2. Open Razorpay's hosted Checkout popup using window.Razorpay.
 *  3. On Razorpay's success callback, call /api/v1/payments/confirm with the
 *     idempotencyKey generated ONCE when CheckoutPage mounts.
 *  4. Call onSuccess(bookingId) or onFailure(errorMessage) accordingly.
 *
 * SECURITY NOTE: The signature verification happens server-side in PaymentService.
 * The Razorpay callback data is untrusted until our backend confirms the HMAC-SHA256.
 */

import { paymentApi } from './api'

// Razorpay is loaded globally via the <script> tag in index.html
declare const window: Window & {
  Razorpay: new (options: RazorpayOptions) => { open(): void }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void
  prefill?: {
    name?: string
    email?: string
  }
  modal?: {
    ondismiss?: () => void
  }
  theme?: {
    color?: string
  }
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Opens the Razorpay Checkout popup for a given booking.
 *
 * @param bookingId       The PENDING booking to pay for.
 * @param idempotencyKey  ONE UUID generated when CheckoutPage mounts. Reused on retries.
 * @param userEmail       Pre-fills Razorpay's email field for convenience.
 * @param userName        Pre-fills Razorpay's name field.
 * @param onSuccess       Called with bookingId when payment is CONFIRMED by the backend.
 * @param onFailure       Called with an error message on cancellation or failure.
 */
export async function payForBooking(
  bookingId: string,
  idempotencyKey: string,
  userEmail: string,
  userName: string,
  onSuccess: (bookingId: string) => void,
  onFailure: (message: string) => void
): Promise<void> {
  // Step 1: Create a Razorpay order on the backend
  let order
  try {
    order = await paymentApi.createOrder(bookingId)
  } catch (err) {
    onFailure(err instanceof Error ? err.message : 'Could not create payment order.')
    return
  }

  // Step 2: Open Razorpay's hosted Checkout UI
  const options: RazorpayOptions = {
    key: order.razorpayKeyId,
    amount: order.amountInPaise,
    currency: order.currency,
    name: 'BookMySeat',
    description: 'Movie ticket booking',
    order_id: order.razorpayOrderId,
    prefill: {
      email: userEmail,
      name: userName,
    },
    handler: async function (response: RazorpaySuccessResponse) {
      // Step 3: Razorpay calls this on success — verify server-side
      try {
        const result = await paymentApi.confirmPayment(
          {
            bookingId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          },
          idempotencyKey
        )

        if (result.status === 'CONFIRMED') {
          onSuccess(result.bookingId)
        } else {
          onFailure(result.message ?? 'Payment failed. Seats have been released.')
        }
      } catch (err) {
        // Network error after Razorpay confirmed — direct user to support
        onFailure(
          'Could not confirm payment with our server. ' +
          'If your amount was deducted, please contact support with booking ID: ' +
          bookingId
        )
      }
    },
    modal: {
      ondismiss: function () {
        onFailure('Payment was cancelled.')
      },
    },
    theme: { color: '#d4a63a' },
  }

  const razorpay = new window.Razorpay(options)
  razorpay.open()
}
