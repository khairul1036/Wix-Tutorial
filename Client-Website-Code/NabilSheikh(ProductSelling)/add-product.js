import wixData from 'wix-data';
import wixWindow from 'wix-window';

// 🔹 Helper function for image upload
async function getImageUrl(id) {
    const el = $w(id);
    if (el.value?.length) {
        const uploaded = await el.uploadFiles();
        if (uploaded.length && uploaded[0].fileUrl) {
            return uploaded[0].fileUrl;
        }
    }
    return null;
}

// 🔹 Helper function for parsing JSON safely
function parseJsonField(rawValue) {
    if (!rawValue || !rawValue.trim()) return null;
    try {
        return JSON.parse(rawValue.trim());
    } catch (err) {
        // console.error("❌ Invalid JSON for field:", rawValue, err);
        return null; // fallback → will save null
    }
}

// 🔹 Helper function to clear fields properly
function clearFields() {
    // Text / Dropdown / RichText / JSON input
    $w('#title').value = "";
    $w('#categoryDropdown').value = "";
    $w('#richtext').value = "";
    $w('#keyBenefitsAndFeatures1').value = "";
    $w('#specifications1').value = "";

    // Upload buttons (images)
    $w('#image1').reset();
    $w('#image2').reset();
    $w('#image3').reset();
    $w('#image4').reset();
    $w('#processSteps').reset();
    $w('#productImage').reset();
}

$w.onReady(function () {
    $w('#submitBtn').onClick(async () => {
        try {
            // Collect text values
            const title = $w('#title').value?.trim();
            const category = $w('#categoryDropdown').value;
            const richtext = $w('#richtext').value?.trim();

            // ✅ Required fields validation
            if (!title || !category || !richtext) {
                wixWindow.openLightbox("RequiredFieldError");
                return;
            }

            // Parse object/json fields
            const keyBenefitsAndFeatures1 = parseJsonField($w('#keyBenefitsAndFeatures1').value);
            const specifications1 = parseJsonField($w('#specifications1').value);

            // Upload images
            const image1 = await getImageUrl('#image1');
            const image2 = await getImageUrl('#image2');
            const image3 = await getImageUrl('#image3');
            const image4 = await getImageUrl('#image4');
            const processSteps = await getImageUrl('#processSteps');
            const productImage = await getImageUrl('#productImage');

            // Build object for CMS
            const toInsert = {
                title_fld: title,
                category: category,
                image1,
                image2,
                image3,
                image4,
                processSteps,
                productImage,
                richtext,
                keyBenefitsAndFeatures1,
                specifications1
            };

            // Insert into CMS
            const result = await wixData.insert('Products', toInsert);
            // console.log("✅ Saved to Products:", result);

            // ✅ Clear all fields after save
            clearFields();

            // Success lightbox
            wixWindow.openLightbox("DataSavedSuccess");

        } catch (err) {
            return
            // console.error("❌ Error saving data:", err);
            // wixWindow.openLightbox("RequiredFieldError");
        }
    });
});