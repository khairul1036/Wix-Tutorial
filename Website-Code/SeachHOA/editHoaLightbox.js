// editHoaLightbox code

import wixWindow from "wix-window";
import wixData from "wix-data";

let currentDocId;

$w.onReady(function () {
    let context = wixWindow.lightbox.getContext();
    if (context && context.docId) {
        currentDocId = context.docId;
        $w("#idtext").text = currentDocId;

        // console.log("currentDocId: ", currentDocId);

        // Import1 to data load
        wixData.query("Import1")
            .eq("_id", currentDocId)
            .find()
            .then((res) => {
                if (res.items.length > 0) {
                    let item = res.items[0];
                    // console.log("Document found:", item);

                    // Input fields
                    $w("#editHoaName").value = item.hoaName || "";
                    $w("#editCountry").value = item.country || "";
                    // $w("#editDatePicker").value = item.date || null;
                    $w("#editDescription").value = item.description || "";

                    if (item.pdfFile && item.pdfFile.length > 0) {
                        $w("#editUploadButton").label = "File Uploaded";
                    }
                } else {
                    console.warn("No document found with this ID:", currentDocId);
                }
            })
            .catch((err) => {
                console.error("Error loading document:", err);
            });
    }

    // Submit button action
    $w("#submitBtn").onClick(() => {
        updateHoaDocument();
    });
});

async function updateHoaDocument() {
    if (!currentDocId) return;

    try {
        // Query item
        let res = await wixData.query("Import1").eq("_id", currentDocId).find();
        if (res.items.length === 0) throw new Error("Document not found for update");

        let item = res.items[0];

        // Input field to new value
        item.hoaName = $w("#editHoaName").value;
        item.country = $w("#editCountry").value;
        // item.date = $w("#editDatePicker").value;
        item.description = $w("#editDescription").value;

        // PDF Upload Handle
        let uploadBtn = $w("#editUploadButton");
        if (uploadBtn.value.length > 0) {
            // File upload start
            let uploadedFile = await uploadBtn.startUpload();
            console.log("Uploaded file:", uploadedFile);

            // Save only URL in array
            item.pdfFile = [uploadedFile.url];
        }

        // Update collection
        let result = await wixData.update("Import1", item);
        console.log("Document updated:", result);
        wixWindow.lightbox.close(result);

    } catch (err) {
        console.error("Update error:", err);
    }
}
