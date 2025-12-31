// backend/flow.jsw

import * as gtf from 'backend/getFlow.js';

/* ==========================
   Generic single email
========================== */
export async function triggerEmail(email = "", vars = {}) {
    return await gtf.default.sendEmail(email, vars);
}

/* ==========================
   Order emails
========================== */
export async function triggerOrderEmails(updatedBooking) {
    try {
        const userEmail = updatedBooking.userEmail;
        // const adminEmail = "admin@gmail.com"; // Admin email if needed

        // console.log("flow updatedBooking: ", updatedBooking);

        // Prepare template variables matching Wix template placeholders
        const vars = {
            name1: updatedBooking.userName || "",
            email1: updatedBooking.userEmail || "",
            phone1: updatedBooking.userPhone || "",
            bookingType1: updatedBooking.bookingType || "",
            date1: updatedBooking.date ? new Date(updatedBooking.date).toLocaleDateString("en-GB") : "",
            timeSlot1: updatedBooking.timeSlot || "",
            net1: updatedBooking.selectedNet || "",
            machine1: updatedBooking.selectedMachine || "",
            coach1: updatedBooking.selectedCoach || "",
            amount1: updatedBooking.amount || "",
            paymentStatus1: updatedBooking.paymentStatus || "",
            link1: "https://www.arcclanebooking.co.uk"
        };

        // Send email to user
        const userResult = await gtf.default.sendEmail(userEmail, vars);

        // Optional: Send email to admin
        // const adminResult = await gtf.default.sendEmail(adminEmail, vars);

        return userResult;
        // return { userResult, adminResult }; // if you want both
    } catch (error) {
        console.error("Error in triggerOrderEmails:", error);
        throw error;
    }
}
