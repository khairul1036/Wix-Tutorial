import wixWindow from "wix-window";
import wixLocation from "wix-location";

$w.onReady(function () {
    const context = wixWindow.lightbox.getContext();
    const pdfUrl = context.pdfUrl;

    if (!pdfUrl) {
        // console.error("❌ No pdfUrl passed to lightbox context.");
        return;
    }

    // Replace "#myForm" with your Wix Form element ID
    $w("#catalogeusLeadForm").onSubmit((event) => {
        // console.log("📥 Form submitted:", event);

        if (event.email_de01) {
            // console.log("⚠️ Form submitted:", event.email_de01);
            // Close the lightbox
            wixWindow.lightbox.close();

            // Delay before opening PDF
            setTimeout(() => {
                // console.log("➡️ Opening PDF:", pdfUrl);
                wixLocation.to(pdfUrl);
            }, 1500);
        } else {
            // console.log("go back");
            return;
        }
    });
});