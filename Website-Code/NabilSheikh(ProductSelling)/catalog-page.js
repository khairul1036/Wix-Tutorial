import wixData from "wix-data";
import wixWindow from "wix-window";

$w.onReady(function () {
    // Catalog collection theke data load
    wixData.query("Catalog")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                // repeater e data set koro
                $w("#repeater1").data = results.items;
            }
        });

    // repeater item onReady
    $w("#repeater1").onItemReady(($item, itemData, index) => {
        // title show
        $item("#text1").text = itemData.title_fld;

        // image show
        $item("#image1").src = itemData.image_fld;

        // pdf click korle open hobe
        // click করলে lightbox খোলে
        $item("#image1").onClick(() => {
			// console.log("pdfurl: ", itemData.pdfUrl )
            wixWindow.openLightbox("CatalogueLightBox", { pdfUrl: itemData.pdfUrl  });
        });

        $item("#text1").onClick(() => {
            wixWindow.openLightbox("CatalogueLightBox", { pdfUrl: itemData.pdfUrl  });
        });
    });
});