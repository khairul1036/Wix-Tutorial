import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(async function () {
    try {
        const res = await fetch("https://ipwhois.app/json/");
        const data = await res.json();

        console.log("IPAPI Response:", data.currency_code);
        changeCurrency(data.currency_code)
        // changeCurrency("INR")

    } catch (err) {
        console.error("Fetch failed:", err);
    }
});

function changeCurrency(currencyCode) {
    // Remove old currency parameter if it exists
    wixLocationFrontend.queryParams.remove(["currency"]);

    // Add the new currency parameter
    wixLocationFrontend.queryParams.add({
        currency: currencyCode
    });
}
