// ==========================================
// 1. MAIN PAGE CODE (Where the HTML component is placed)
// ==========================================
// Select your HTML Component in the Wix editor and set its ID to #htmlComponent1 (or update the ID in the code below)

import wixWindow from 'wix-window'; 
// Note: If you are using the newer Wix editor version, you can also use:
// import wixWindowFrontend from 'wix-window-frontend';

$w.onReady(function () {
    // Listen to messages from the HTML Component
    $w("#htmlComponent1").onMessage((event) => {
        const receivedData = event.data;
        
        // Check if the message is for opening the meal details popup
        if (receivedData && receivedData.type === 'clickMeal') {
            const mealDetails = {
                name: receivedData.name,
                detail: receivedData.detail,
                imgUrl: receivedData.imgUrl
            };
            
            // Open the Wix Lightbox named "DetailsPopup" and pass the meal details
            wixWindow.openLightbox("DetailsPopup", mealDetails)
                .then(() => {
                    console.log("DetailsPopup lightbox opened successfully.");
                })
                .catch((error) => {
                    console.error("Failed to open DetailsPopup lightbox:", error);
                });
        }
    });
});

// ==========================================
// 2. LIGHTBOX CODE (To be placed inside the "DetailsPopup" Lightbox code panel)
// ==========================================
// /import wixWindow from 'wix-window';

// $w.onReady(() => {
//     const mealData = wixWindow.lightbox.getContext();

//     console.log(mealData);

//     if (!mealData) return;

//     $w("#mealName").text = mealData.name || "";
//     $w("#mealDetails").text = mealData.detail || "";

//     if (mealData.imgUrl) {
//         $w("#mealImage").src = mealData.imgUrl;
//         $w("#mealImage").alt = mealData.name || "";
//         $w("#mealImage").show();
//     } else {
//         $w("#mealImage").hide();
//     }
// });