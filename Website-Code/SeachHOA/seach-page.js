// search page code

import wixLocation from 'wix-location';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixWindow from 'wix-window';
import { getUserSubscriptions } from 'backend/pricing.jsw';
import { sendRequestEmailToAdmin } from 'backend/sendRequestEmail.jsw';

let count = 0;

$w.onReady(() => {
    // ------------------ HANDLE URL SEARCH QUERY ------------------
    const query = wixLocation.query.search;
    if(query) {
        $w('#SearchbarHome').value = query;
        performSearch(query); // Filter dataset based on query
    }

    // ------------------ REPEATER ITEM CLICK ------------------
    $w("#repeaterSearch").onItemReady(($item, itemData) => {
        $item("#button3").onClick(() => {
            handleDownloadClick(itemData);
        });
    });

    // ------------------ SEARCH INPUT ------------------
    $w("#SearchbarHome").onInput(() => {
        performSearch();
    });

    // ------------------ SEND REQUEST BUTTON ------------------
    $w("#sendRequestBtn").onClick(async () => {
        const searchText = $w("#SearchbarHome").value.trim();
        if (!searchText) return;

        try {
            const res = await sendRequestEmailToAdmin(searchText);
            console.log(res);
        } catch (err) {
            console.error(err);
        }

        wixWindow.openLightbox("sendRequest"); // Open lightbox
    });
});

// ------------------ HANDLE DOWNLOAD ------------------
async function handleDownloadClick(itemData) {
    const user = wixUsers.currentUser;

    if (!user.loggedIn) {
        wixUsers.promptLogin()
            .then(() => console.log("Login successful - click again to download"))
            .catch(() => console.log("Login cancelled"));
        return;
    }

    try {
        const activeOrders = await getUserSubscriptions();

        if (activeOrders.length > 0) {
            const { planName } = activeOrders[0];
            console.log("Plan Name:", planName);

            if (planName === "Starter Plan") {
                if (count !== 0) {
                    console.log("Starter Plan download limit reached.");
                    wixLocation.to("/pricing-plans/list");
                    return;
                }
                openPdf(itemData.pdfFile);
                count = 1;
            } else {
                openPdf(itemData.pdfFile);
            }
        } else {
            console.log("User has no active subscription.");
            wixLocation.to("/pricing-plans/list");
        }
    } catch (err) {
        console.error("Error fetching subscriptions:", err);
    }
}

// ------------------ OPEN PDF ------------------
function openPdf(url) {
    if (url) {
        wixLocation.to(url);
    } else {
        console.error("No PDF URL found in pdfFile field");
    }
}

// ------------------ PERFORM SEARCH ------------------
function performSearch(query = null) {
    const searchQuery = query || $w("#SearchbarHome").value.trim();

    if (searchQuery.length > 0) {
        $w("#collectionDatasetName").setFilter(
            wixData.filter()
                .contains("hoaName", searchQuery)
                .or(wixData.filter().contains("country", searchQuery))
        )
        .then(() => updateRepeaterVisibility())
        .catch((err) => {
            console.error("Failed to filter dataset:", err);
            showNotFound();
        });
    } else {
        $w("#collectionDatasetName").setFilter(wixData.filter())
            .then(() => clearNotFound())
            .catch((err) => {
                console.error("Failed to clear filter:", err);
                clearNotFound();
            });
    }
}

// ------------------ UPDATE REPEATER VISIBILITY ------------------
function updateRepeaterVisibility() {
    $w("#collectionDatasetName").getItems(0, 1).then((results) => {
        if (results.totalCount > 0) {
            $w("#repeaterSearch").expand();
            clearNotFound();
        } else {
            showNotFound();
        }
    });
}

// ------------------ SHOW / CLEAR NOT FOUND ------------------
function showNotFound() {
    $w("#repeaterSearch").collapse();
    $w("#notFound").show();
    $w("#sendRequestBtn").enable();
    $w("#sendRequestBtn").label = "Send Request";
    $w("#sendRequestBtn").show();
}

function clearNotFound() {
    $w("#repeaterSearch").expand();
    $w("#notFound").hide();
    $w("#sendRequestBtn").hide();
}
