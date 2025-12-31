// backend/getFlow.js


import wixData from 'wix-data';
import wixCrmBackend from 'wix-crm-backend';

const trigger = {
    contact: {
        get: async function (email = "") {
            try {
                let contactInfo = { emails: [{ tag: "MAIN", email: email, primary: true }] };
                const result = await wixCrmBackend.contacts.appendOrCreateContact(contactInfo);
                return result.contactId || "";
            } catch (err) {
                return "";
            }
        },
        emailContact: async function (contactId = "", vars = {}) {
            try {
                const options = { variables: vars };
                await wixCrmBackend.triggeredEmails.emailContact("Uxue6co", contactId, options);
                return true;
            } catch (err) {
                return false;
            }
        }
    },
    sendEmail: async function (email = "", vars = {}) {
        const contactId = await this.contact.get(email);
        if (!contactId) {
            return false;
        }

        // Default vars if none provided
        const defaultVars = {
            name1: email.split(/@/)[0],
            email1: email,
            phone1: "",
            country1: "",
            mealPlanTitle: "",
            daysType: "",
            days: 0,
            mealsPerDay: "",
            weeks: "",
            startDate: "",
            totalMeals: 0,
            pricePerMeal: 0,
            totalPrice: 0,
            discountAmount: 0,
            discountPercent: 0,
            totalWithTax: 0,
            addOnsList: "",
            amount1: 0,
            tax1: 0,
            link1: ""
        };

        const variables = Object.keys(vars).length ? vars : defaultVars;

        return await this.contact.emailContact(contactId, variables);
    }
};

export default trigger;

// import wixData from 'wix-data';
// import wixCrmBackend from 'wix-crm-backend';

// const trigger = {
//     contact: {
//         get: async function (email = "") {
//             let contactInfo = { emails: [{ tag: "MAIN", email: email, primary: true }] };
//             return (await wixCrmBackend.contacts.appendOrCreateContact(contactInfo)).contactId || "";
//         },
//         emailContact: function (contactId = "", vars = {}) {
//             const options = { variables: vars };
//             return wixCrmBackend.triggeredEmails.emailContact("Uxue6co", contactId, options)
//                 .then(() => true)
//                 .catch((err) => {
//                     console.log(err, err.stack);
//                     return false;
//                 });
//         }
//     },
//     sendEmail: async function (email = "", vars = {}) {
//         const contactId = await this.contact.get(email);
//         if (contactId.length > 0) {
//             // যদি vars না দেয়া হয়, default set করি
//             const variables = Object.keys(vars).length ? vars : {
//                 name1: email.split(/@/g)[0],
//                 contact1: "contact@yourdomain.com",
//                 link1: "https://bit.ly/creativelynino"
//             };
//             return await this.contact.emailContact(contactId, variables);
//         }
//         console.log("ContactId error");
//         return false;
//     }
// };

// export default trigger;

// =========================================
// =========================================
// =========================================
// =========================================
// backend/flow.js

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
export async function triggerOrderEmails(orderData) {
    const userEmail = orderData.userEmail;
    const adminEmail = "semexpert.cms@gmail.com"; // Admin email

    // Clean cart JSON
    const cart = orderData.cart || {};

    // Prepare add-ons list for template
    const addOnsList = (cart.addOns || [])
        .map(a => `${a.name} - $${a.price} x ${a.qty} = $${a.totalAddOnsPrice}`)
        .join("\n");

    // Prepare template variables matching Wix template placeholders
    const vars = {
        name1: orderData.userName,
        email1: orderData.userEmail,
        phone1: orderData.userPhone || "",
        country1: orderData.userCountry || "",
        amount1: orderData.amount,
        tax1: orderData.tax,
        mealPlanTitle: cart.meal?.planTitle || "",
        daysType: cart.meal?.daysType || "",
        days: cart.meal?.days || 0,
        mealsPerDay: cart.meal?.mealsPerDay || "",
        weeks: cart.meal?.weeks || "",
        startDate: cart.meal?.startDate || "",
        totalMeals: cart.meal?.totalMeals || 0,
        pricePerMeal: cart.meal?.pricePerMeal || 0,
        totalPrice: cart.meal?.totalPrice || 0,
        discountAmount: cart.meal?.discountAmount || 0,
        discountPercent: cart.meal?.discountPercent || 0,
        totalWithTax: cart.meal?.totalWithTax || 0,
        addOnsList: addOnsList,
        link1: "https:" // order details page link
    };

    // Send emails
    const userResult = await gtf.default.sendEmail(userEmail, vars);
    const adminResult = await gtf.default.sendEmail(adminEmail, vars);

    return { userResult, adminResult };
}

// import * as gtf from 'backend/getFlow.js';

// export async function triggerEmail(email = "") {
//     return await gtf.default.sendEmail(email);
// }

// // নতুন function: order emails send করা
// export async function triggerOrderEmails(orderData) {
//     const userEmail = orderData.userEmail;
//     const adminEmail = "semexpert.cms@gmail.com"; // এখানে admin email বসাও

//     const vars = {
//         name1: orderData.userName,
//         email1: orderData.userEmail,
//         amount1: orderData.amount,
//         items1: JSON.stringify(orderData.items),
//         link1: "https://bit.ly/creativelynino" // চাইলে order details page link
//     };

//     const userResult = await gtf.default.sendEmail(userEmail, vars);
//     const adminResult = await gtf.default.sendEmail(adminEmail, vars);

//     return { userResult, adminResult };
// }

// =========================================
// =========================================
// =========================================
// =========================================
// =========================================
// frontend code

import * as run from 'backend/flow.jsw';
// Full email JSON
const emailData = {
    userName: orderData.userName,
    userEmail: orderData.userEmail,
    userPhone: orderData.userPhone,
    userCountry: orderData.userCountry,
    amount: orderData.amount, // total with tax
    tax: orderData.tax,
    cart: emailCart
};

console.log('[Checkout] emailData to send to triggerOrderEmails:', emailData);

await run.triggerOrderEmails(emailData);

