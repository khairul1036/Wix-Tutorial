// frontend

$w.onReady(function () {
    
    // ডাইনামিক পেজের ডাটা সেট লোড হওয়া পর্যন্ত অপেক্ষা করা
    $w("#dynamicDataset").onReady(() => {
        
        // বর্তমান প্রপার্টির পুরো ডাটাবেস আইটেমটি নিয়ে আসা
        const currentItem = $w("#dynamicDataset").getCurrentItem();

		 $w("#propTitle").text = currentItem.title || "";

        // ১. Price সেট করা
        $w("#propPrice").text = currentItem.price || "Price on asking";

		let propTypeStr = currentItem.bedrooms ? `${currentItem.bedrooms} Bed ${currentItem.type}` : (currentItem.type || "");
        $w("#propType").text = propTypeStr;

        // ২. Property Description সেট করা
        $w("#propDesc").text = currentItem.description || "No description available.";

        // ৩. All Photos -> Gallery-তে সেট করা
        if (currentItem.images) {
            try {
                // ডাটাবেস থেকে JSON স্ট্রিংটিকে আবার অ্যারেতে রূপান্তর করা
                let parsedImages = JSON.parse(currentItem.images);
                
                if (parsedImages && parsedImages.length > 0) {
                    // Wix Gallery-এর রিকোয়ারমেন্ট অনুযায়ী ডাটা ফরমেট করা
                    let galleryItems = parsedImages.map((imgUrl, index) => {
                        return {
                            "type": "image",
                            "src": imgUrl,
                            "title": "Property Photo " + (index + 1)
                        };
                    });
                    
                    // ফরমেট করা ডাটা গ্যালারিতে পাঠানো
                    $w("#galleryImages").items = galleryItems;
                }
            } catch(error) {
                console.error("🔴 Error parsing gallery images:", error);
            }
        }

        // ৪. EPC Image সেট করা
        if (currentItem.epc_image) {
            $w("#epcImage").src = currentItem.epc_image;
            $w("#epcImage").show(); // যদি আগে থেকে লুকানো থাকে
        } else {
            // যদি এই প্রপার্টির কোনো EPC না থাকে, তাহলে ছবিটা লুকিয়ে ফেলবে
            $w("#epcImage").hide(); 
            console.log("🟡 No EPC image available for this property.");
        }
        
    });
});