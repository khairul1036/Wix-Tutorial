
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
export async function triggerOrderEmails(userData) {
    const userEmail = userData.userEmail;
    const adminEmail = "[EMAIL_ADDRESS]"; // Admin email

    // Prepare template variables matching Wix template placeholders
    const vars = {

    };

    // Send emails
    const userResult = await gtf.default.sendEmail(userEmail, vars);
    const adminResult = await gtf.default.sendEmail(adminEmail, vars);

    return { userResult, adminResult };
}
