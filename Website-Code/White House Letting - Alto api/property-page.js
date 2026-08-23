// frontend

import { searchAltoProperties } from 'backend/vebraApi';
import wixLocation from 'wix-location'; // ডাইনামিক পেজে যাওয়ার জন্য

$w.onReady(function () {
    
    // 🎨 Repeater-এ ডাটা বাইন্ডিং
    $w("#propertyRepeater").onItemReady(($item, itemData) => {
        $item("#propTitle").text = itemData.title || "";
        $item("#propPrice").text = itemData.price || "";
        
        let propTypeStr = itemData.bedrooms ? `${itemData.bedrooms} Bed ${itemData.type}` : (itemData.type || "");
        $item("#propType").text = propTypeStr;

        if (itemData.description) {
            let cleanDesc = itemData.description.length > 80 
                ? itemData.description.substring(0,80) + "..." 
                : itemData.description;
            $item("#propDesc").text = cleanDesc;
        } else {
            $item("#propDesc").text = "";
        }
        
        // 📸 ইমেজ রেন্ডার করা (JSON পার্স করে প্রথমটি নেওয়া)
        let defaultImage = "https://via.placeholder.com/400x300?text=No+Image+Available";
        if (itemData.images) {
            try {
                let imagesArray = JSON.parse(itemData.images);
                $item("#propImage").src = (imagesArray && imagesArray.length > 0) ? imagesArray[0] : defaultImage;
            } catch (e) {
                $item("#propImage").src = defaultImage;
            }
        } else {
            $item("#propImage").src = defaultImage;
        }

        // 🚀 Details Button Click Event (Dynamic Page-এ রিডাইরেক্ট)
        $item("#detailsButton").onClick(() => {
            // Wix-এর ডাইনামিক পেজের স্ট্রাকচার অনুযায়ী URL তৈরি করা
            // itemData["link-properties-title"] হলো Wix-এর অটো-জেনারেটেড ডাইনামিক লিংক ফিল্ড
            let dynamicUrl = itemData["link-properties-title"]; 
            
            if (dynamicUrl) {
                wixLocation.to(dynamicUrl);
            } else {
                console.error("Dynamic link not found for this property.");
            }
        });
    });

    // 🚀 Initial UI State
    $w("#propertyRepeater").hide();
    $w("#messageText").text = "Search for properties above to see results.";
    $w("#messageText").show();

    // 🚀 Search Button Click Event
    $w("#searchButton").onClick(async () => {
        const query = $w("#searchInput").value.trim();
        
        if (query === "") {
            $w("#propertyRepeater").hide();
            $w("#messageText").text = "Please enter a location or keyword to search.";
            $w("#messageText").show();
            return;
        }

        $w("#searchButton").label = "Searching..."; 
        $w("#searchButton").disable();
        $w("#propertyRepeater").hide(); 
        $w("#messageText").text = "Searching properties...";
        $w("#messageText").show();

        try {
            const searchResults = await searchAltoProperties(query);

            if (searchResults && searchResults.length > 0) {
                renderRepeater(searchResults);
                $w("#messageText").hide();
                $w("#propertyRepeater").show();
            } else {
                $w("#propertyRepeater").hide();
                $w("#messageText").text = "No properties found matching your search.";
                $w("#messageText").show();
            }
        } catch (error) {
            console.error("🔴 Search Error:", error);
            $w("#propertyRepeater").hide();
            $w("#messageText").text = "Something went wrong. Please try again later.";
            $w("#messageText").show();
        } finally {
            $w("#searchButton").label = "Search"; 
            $w("#searchButton").enable();
        }
    });
});

// 🔄 ডাটা Repeater-এর ফরমেটে রেন্ডার করা
function renderRepeater(data) {
    const formattedData = data.map((item) => {
        return { ...item }; 
    });
    
    $w("#propertyRepeater").data = formattedData;
}
