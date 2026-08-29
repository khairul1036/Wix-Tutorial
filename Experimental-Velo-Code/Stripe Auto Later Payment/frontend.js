import { initStripeSetup, processBookingBackend } from 'backend/stripePayment';

$w.onReady(function () {
  $w("#html1").onMessage(async (event) => {
    
    // ১. HTML লোড হলে Stripe-এর Secret পাঠানো
    if (event.data && event.data.type === "htmlReady") {
      const stripeData = await initStripeSetup("customer@example.com"); // ডিফল্ট ইমেইল
      if (stripeData.success) {
        $w("#html1").postMessage({
          type: "initStripe",
          clientSecret: stripeData.clientSecret,
          customerId: stripeData.customerId
        });
      }
    }

    // ২. ফর্ম সাবমিট হলে ডেটা Velo-তে আসবে এবং ব্যাকএন্ডে পাঠানো হবে
    if (event.data && event.data.type === "ecoGuardBookingSubmit") {
      const payload = event.data.payload;

      console.log("Sending booking data to backend...");

      // ডেটা ব্যাকএন্ডে পাঠানো (ব্যাকএন্ড নিজেই ডেটাবেসে ইনসার্ট করবে এবং ১ মিনিটের টাইমার সেট করবে)
      processBookingBackend(payload)
        .then((result) => {
            if (result.success) {
                console.log("✅ Booking successfully saved by backend!");
                console.log("⏳ A background task will charge the card in 1 minute.");
            } else {
                console.error("❌ Failed to save booking:", result.error);
            }
        })
        .catch((err) => console.error("Backend connection error:", err));
    }
  });
});