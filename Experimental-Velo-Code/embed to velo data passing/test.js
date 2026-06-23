import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixPay from 'wix-pay-frontend';
import { createClassPayment } from 'backend/pay.jsw';
import * as run from 'backend/flow.jsw';

let bookedSlotsCache = null;

async function fetchAndSendBookings(dateStr) {
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        let query = wixData.query("PoolBookings");

        if (dateStr) {
            const dateObj = new Date(dateStr);
            query = query.eq("bookingDate", dateStr)
                         .or(wixData.query("PoolBookings").eq("bookingDate", dateObj));
        } else {
            query = query.ge("bookingDate", todayStr);
        }

        const results = await query.limit(1000).find();

        bookedSlotsCache = results.items
            .filter(item => item.bookingDate && item.timeSlot)
            .map(item => {
                let bDate = item.bookingDate;
                if (bDate instanceof Date) {
                    const yyyy = bDate.getFullYear();
                    const mm = String(bDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(bDate.getDate()).padStart(2, '0');
                    bDate = `${yyyy}-${mm}-${dd}`;
                } else if (typeof bDate === 'string') {
                    bDate = bDate.trim();
                    if (bDate.includes('T')) {
                        bDate = bDate.split('T')[0];
                    }
                }
                return {
                    bookingDate: bDate,
                    timeSlot: item.timeSlot
                };
            });

        console.log("bookedSlotsCache: ", bookedSlotsCache);

        $w("#html4").postMessage({
            type: "bookingsData",
            bookings: bookedSlotsCache,
            requestedDate: dateStr || null
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
            await fetchAndSendBookings(event.data.date);
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

                userName: result.userInfo.firstName + " " + result.userInfo.lastName,
                userEmail: result.userInfo.email,
                userPhone: result.userInfo.phone,
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

            // Full email JSON
            const emailData = {
                ownerName: bookingItem.ownerName,
                ownerEmail: bookingItem.ownerEmail,
                ownerPhone: bookingItem.ownerPhone,
                address: bookingItem.address,
                emergencyName: bookingItem.emergencyName,
                emergencyPhone: bookingItem.emergencyPhone,
                humansCount: bookingItem.humansCount,
                dogCount: bookingItem.dogCount,
                bookingDateFormatted: bookingItem.bookingDateFormatted,
                timeSlot: bookingItem.timeSlot,
                totalAmount: bookingItem.totalAmount,
                paymentStatus: bookingItem.paymentStatus,
                transactionId: bookingItem.transactionId,
                dogs: dogs.map(d => ({
                    name: d.name,
                    breed: d.breed,
                    age: d.age,
                    weight: d.weight,
                    notes: d.notes
                }))
            };

            console.log('[Checkout] emailData to send to triggerOrderEmails:', emailData);

            await run.triggerOrderEmails(emailData);

            // Redirect user
            // wixLocation.to("/");
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