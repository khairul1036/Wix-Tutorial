// backend/pay.jsw

import wixPayBackend from 'wix-pay-backend';

/**
 * Create a payment for a class
 * @param {Object} classItem - { amount: number, className: string }
 * @returns {Promise} Payment object
 */
export function createClassPayment(classItem) {
    return wixPayBackend.createPayment({
        amount: classItem.amount, // numeric value
        currency: "USD",
        items: [{
            name: classItem.className,
            quantity: 1,
            price: classItem.amount
        }]
    });
}


// ====================================================================
// forntend code

$w.onReady(function () {

    const newBooking = {
        bookingType: "Name",
        amount: 30
    }
    try {
        // Step 1: Create payment in backend
        const payment = await createClassPayment({
            amount: newBooking.amount,
            className: bookingType
        });

        // Step 2: Start Wix Pay with payment id
        const result = await wixPay.startPayment(payment.id, {
            termsAndConditionsLink: 'https://www.google.com/terms-conditions'
        });

        console.log("result:", result);
        // -------------------- Online payment -------------------- 
        if (result.status === "Successful") {
            const saveData = {
                ...newBooking,
                userName: result.userInfo.firstName + " " + result.userInfo.lastName,
                userEmail: result.userInfo.email,
                userPhone: result.userInfo.phone,
                transactionId: result.transactionId,
                paymentStatus: "Paid"
            };

            // Step 3: Save booking
            await wixData.insert("BookingsCollection", saveData);
            console.log("Booking saved:", saveData);

            // Step 4: Redirect user
            // wixLocation.to("/");
        }
        // -------------------- Offline payment -------------------- 
        else if (result.status === "Offline") {
            const saveData = {
                ...newBooking,
                userName: result.userInfo.firstName + " " + result.userInfo.lastName,
                userEmail: result.userInfo.email,
                userPhone: result.userInfo.phone,
                paymentStatus: "Offline"
            };

            // Step 3: Save booking
            await wixData.insert("BookingsCollection", saveData); // Your collection name "BookingsCollection"
            console.log("Booking saved:", saveData);

            // Step 4: Redirect user
            // wixLocation.to("/");
        }
        // -------------------- Cancelled payment -------------------- 
        else if (result.status === "Cancelled") {
            console.log("Payment is: ", result.status);
        }
        // -------------------- Payment not completed. -------------------- 
        else {
            console.log("Payment not completed:", result.status);
        }

    } catch (error) {
        console.error("Payment error:", error);
    }
});

