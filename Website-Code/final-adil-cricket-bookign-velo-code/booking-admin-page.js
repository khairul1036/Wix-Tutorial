// fronend code 

import wixWindow from 'wix-window';
import wixData from 'wix-data';

$w.onReady(function () {
    $w("#bookingRepeater").onItemReady(($item, itemData) => {
        $item("#editButton").onClick(async () => {
            // console.log("Selected booking data:", itemData);

            // Open lightbox and wait for close response
            const updatedBooking = await wixWindow.openLightbox("bookingEditLightbox", itemData._id);

            if (updatedBooking) {
                // console.log("Lightbox returned updated data:", updatedBooking);

                // Option 1: Refresh dataset (if repeater is bound to dataset)
                if ($w("#dataset1")) {
                    $w("#dataset1").refresh()
                        .then(() => console.log("Repeater refreshed from dataset"));
                }

                // Option 2: If you’re manually setting repeater data
                else {
                    const refreshed = await wixData.query("BookingsCollection").ascending("_createdDate").find();
                    $w("#bookingRepeater").data = refreshed.items;
                    // console.log("Repeater data manually refreshed");
                }
            }
        });
    });
});
