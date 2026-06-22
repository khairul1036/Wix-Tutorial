import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {

    $w("#html4").onMessage(async (event) => {
        console.log("MESSAGE RECEIVED FROM FORM:", event.data);

        if (event.data.type !== "bookingSubmission") {
            return;
        }

        const bookingData = event.data.data;
        console.log("Booking Submission Payload:", bookingData);

        try {
            const owner = bookingData.owner || {};
            const booking = bookingData.booking || {};

            // ==========================
            // SAVE MAIN BOOKING
            // ==========================
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
                totalAmount: Number(booking.totalAmount)
            };

            const savedBooking = await wixData.insert(
                "PoolBookings",
                bookingItem
            );

            console.log("Booking Saved:", savedBooking);

            const bookingId = savedBooking._id;

            // ==========================
            // SAVE ALL DOGS
            // ==========================
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
                    dogItems.map(item =>
                        wixData.insert(
                            "PoolBookingDogs",
                            item
                        )
                    )
                );

                console.log("Dogs Saved Successfully");
            }

            // Success message
            $w("#html4").postMessage({
                type: "bookingSaved",
                bookingId: bookingId
            });

            // Optional redirect
            wixLocation.to("/");

        } catch (error) {
            console.error("Error Saving Booking:", error);

            $w("#html4").postMessage({
                type: "bookingError",
                message: error.message
            });
        }
    });

});