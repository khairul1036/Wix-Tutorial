import { fetch } from 'wix-fetch';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbysHPlL8fAbIlEjhGjGrXTxDd79ao6RK7ciEAgahDMsPBjJlviz-_ZZN5XJneLtlkM8/exec";

export async function saveEmail(email, column) {

    const response = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            column
        })
    });

    const result = await response.json();

    return result;
}

// =========================

import { saveEmail } from 'backend/googleSheets';

$w.onReady(function () {
    $w("#unlockPageForm").onSubmit(async (event) => {

        const email = event.email_2752;

        const res = await saveEmail(email, "aftercare");

        console.log(res);

        if (res.success) {
            console.log("✅ Google Sheet Saved");
        } else {
            console.error("❌ Failed:", res.message);
        }
    });
});

// =========================

import { saveEmail } from 'backend/googleSheets';

$w.onReady(function () {
    $w("#homePageForm").onSubmit(async (event) => {

        const email = event.email_9e48;

        const res = await saveEmail(email, "home");

        console.log(res);

        if (res.success) {
            console.log("✅ Google Sheet Saved");
        } else {
            console.error("❌ Failed:", res.message);
        }
    });
});


// ======================
// backend code

import { saveEmail } from 'backend/googleSheets';

$w.onReady(function () {
    $w("#supportPageForm").onSubmit(async (event) => {

        const email = event.email_9d58;

        const res = await saveEmail(email, "support");

        console.log(res);

        if (res.success) {
            console.log("✅ Google Sheet Saved");
        } else {
            console.error("❌ Failed:", res.message);
        }
    });
});

