import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixPay from 'wix-pay-frontend';
import { createClassPayment } from 'backend/pay.jsw';

let bookedSlotsCache = null;

async function fetchAndSendBookings() {
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const results = await wixData.query("PoolBookings")
            .ge("bookingDate", todayStr)
            .limit(1000)
            .find();

        bookedSlotsCache = results.items.map(item => ({
            bookingDate: item.bookingDate,
            timeSlot: item.timeSlot
        }));

        $w("#html4").postMessage({
            type: "bookingsData",
            bookings: bookedSlotsCache
        });
    } catch (error) {
        console.error("Error fetching bookings in Wix:", error);
    }
}

$w.onReady(function () {
    // Start fetching immediately on page load
    fetchAndSendBookings();

    $w("#html4").onMessage(async (event) => {
        console.log("MESSAGE RECEIVED FROM FORM:", event.data);

        if (event.data.type === "requestBookings") {
            if (bookedSlotsCache !== null) {
                $w("#html4").postMessage({
                    type: "bookingsData",
                    bookings: bookedSlotsCache
                });
            } else {
                await fetchAndSendBookings();
            }
            return;
        }

        if (event.data.type !== "bookingSubmission") {
            return;
        }

        const bookingData = event.data.data;
        console.log("Booking Submission Payload:", bookingData);

        try {
            await wixCustomPayment(bookingData);
        } catch (error) {
            console.error("Booking process error:", error);
            $w("#html4").postMessage({
                type: "bookingError",
                message: error.message || "An error occurred during booking process."
            });
        }
    });

});

async function wixCustomPayment(bookingData) {
    try {
        const owner = bookingData.owner || {};
        const booking = bookingData.booking || {};

        // Step 1: Create payment in backend
        const payment = await createClassPayment({
            amount: Number(booking.totalAmount),
            className: "Dog Pool Session"
        });

        // Step 2: Start Wix Pay with payment id
        const result = await wixPay.startPayment(payment.id, {
            termsAndConditionsLink: 'https://www.google.com/terms-conditions'
        });

        console.log("Wix Pay Result:", result);

        // -------------------- Successful / Offline payment -------------------- 
        if (result.status === "Successful" || result.status === "Offline") {
            // Save main booking
            const bookingItem = {
                ownerName: owner.fullName,
                ownerPhone: owner.phone,
                ownerEmail: owner.email,
                humansCount: Number(owner.humansCount),
                address: owner.address,
                emergencyName: owner.emergencyName,
                emergencyPhone: owner.emergencyPhone,

                dogCount: Number(bookingData.dogCount),

                bookingDate: booking.date,
                bookingDateFormatted: booking.dateFormatted,
                timeSlot: booking.timeSlot,
                totalAmount: Number(booking.totalAmount),
                paymentStatus: result.status === "Successful" ? "Paid" : "Offline",
                transactionId: result.transactionId || ""
            };

            const savedBooking = await wixData.insert("PoolBookings", bookingItem);
            console.log("Booking Saved:", savedBooking);

            const bookingId = savedBooking._id;

            // Save dogs
            const dogs = bookingData.dogs || [];
            if (dogs.length > 0) {
                const dogItems = dogs.map((dog) => {
                    return {
                        bookingId: bookingId,
                        dogName: dog.name,
                        breed: dog.breed,
                        age: dog.age,
                        weight: dog.weight,
                        notes: dog.notes
                    };
                });

                await Promise.all(
                    dogItems.map(item => wixData.insert("PoolBookingDogs", item))
                );
                console.log("Dogs Saved Successfully");
            }

            // Success message
            $w("#html4").postMessage({
                type: "bookingSaved",
                bookingId: bookingId
            });

            // Redirect user
            wixLocation.to("/");
        }
        // -------------------- Cancelled payment -------------------- 
        else if (result.status === "Cancelled") {
            console.log("Payment Cancelled");
            $w("#html4").postMessage({
                type: "bookingError",
                message: "Payment was cancelled."
            });
        }
        // -------------------- Payment not completed -------------------- 
        else {
            console.log("Payment not completed:", result.status);
            $w("#html4").postMessage({
                type: "bookingError",
                message: "Payment status: " + result.status
            });
        }

    } catch (error) {
        console.error("Payment error:", error);
        throw error;
    }
}