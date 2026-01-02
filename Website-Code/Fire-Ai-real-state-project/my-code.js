// =====================
// emailInput
// addressInput
// bedroomsInput
// bathroomsInput
// squareFootageInput
// yearbuiltInput
// conditionScoreInput
// userNotesInput
// submitButton
// errorText


// https://real-estate-ai-backend-wix-data-analysis.onrender.com/api/run-valuation

// {
//   "address": "123 Elm St, Springfield, IL",
//   "bedrooms": 3,
//   "bathrooms": 2,
//   "square_footage": 1500,
//   "year_built": 1995,
//   "condition_score": 8,
//   "user_notes": "Looking for a home in a quiet neighborhood with a big backyard.",
//   "email": "user@example.com"
// }



import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { syncAllCarolinaListings } from 'backend/mls-sync';

$w.onReady(async () => {
    const { success, totalListingsSaved } = await syncAllCarolinaListings();
    // console.log({ success, totalListingsSaved });

    $w('#errorText').hide();
    $w('#submitButton').onClick(handleSubmit);
});

async function handleSubmit() {
    $w('#errorText').hide();

    // ---- Get values ----
    const email = $w('#emailInput').value;
    const address = $w('#addressInput').value;
    const bedrooms = Number($w('#bedroomsInput').value);
    const bathrooms = Number($w('#bathroomsInput').value);
    const squareFootage = Number($w('#squareFootageInput').value);
    const yearBuilt = Number($w('#yearbuiltInput').value);
    const conditionScore = Number($w('#conditionScoreInput').value);
    const userNotes = $w('#userNotesInput').value;

    // ---- Validation ----
    if (
        !email ||
        !address ||
        !bedrooms ||
        !bathrooms ||
        !squareFootage ||
        !yearBuilt ||
        !conditionScore
    ) {
        showError("Please fill in all required fields.");
        return;
    }

    // ---- Disable button ----
    $w('#submitButton').disable();
    $w('#submitButton').label = "Submitting...";

    // ---- Build API payload ----
    const payload = {
        address,
        bedrooms,
        bathrooms,
        square_footage: squareFootage,
        year_built: yearBuilt,
        condition_score: conditionScore,
        user_notes: userNotes,
        email
    };

    try {
        const response = await fetch(
            "https://real-estate-ai-backend-wix-data-analysis.onrender.com/api/run-valuation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
        );

        const result = await response.json();
        console.log('result:', result);

        // ---- Handle success ----
        if (result.success === true) {
            const redirectUrl =
                `https://dev-sitex-1858428749.wix-development-sites.org/cleandata/${result.itemId}`;

            wixLocation.to(redirectUrl);
            return;
        }

        throw new Error("Valuation failed");

    } catch (error) {
        showError("Something went wrong. Please try again.");
        console.error(error);
    } finally {
        $w('#submitButton').enable();
        $w('#submitButton').label = "Submit";
    }
}

// ---- Error handler ----
function showError(message) {
    $w('#errorText').text = message;
    $w('#errorText').show();

    setTimeout(() => {
        $w('#errorText').hide();
    }, 2000);
}