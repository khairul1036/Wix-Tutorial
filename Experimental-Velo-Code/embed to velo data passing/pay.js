// backend/pay.jsw

import wixPayBackend from 'wix-pay-backend';

/**
 * Create a payment for a class
 * @param {Object} classItem - { amount: number, className: string }
 * @returns {Promise} Payment object
 */
export function createClassPayment(classItem) {
    return wixPayBackend.createPayment({
        amount: Number(classItem.amount), // Ensure amount is numeric
        currency: "GBP", // Set currency to GBP to match the form (£)
        items: [{
            name: classItem.className,
            quantity: 1,
            price: Number(classItem.amount)
        }]
    });
}

