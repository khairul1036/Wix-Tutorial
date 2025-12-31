// viewAllHoaLightbox code

import wixData from "wix-data";
import wixWindow from "wix-window";

$w.onReady(function () {
    loadHoaDocuments();
});

function loadHoaDocuments() {
    wixData.query("hoa_documents")
        .find()
        .then((results) => {
            $w("#repeater1").data = results.items;
        });

    $w("#repeater1").onItemReady(($item, itemData) => {
        $item("#openEditLightBox").onClick(() => {
            wixWindow.openLightbox("editLightBox", { docId: itemData._id });
        });
    });
}
