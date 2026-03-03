<script>
// ================================
// CURSOR ACTIVITY TIMER + AUTO LOGOUT
// Wix Body-End Safe
// ================================

(function() {
    // Only run in browser
    if (typeof window === "undefined") return;

    console.log("✅ Cursor tracker + auto logout initialized (Body-End)");

    const CHECK_INTERVAL = 1000; // 1 sec check
    const IDLE_LIMIT = 60; // 1 minute (60 sec)

    let lastMoveTime = Date.now();
    let movingSeconds = 0;
    let stoppedSeconds = 0;

    const LOCAL_KEY = "platform_app_675bbcef-18d8-41f5-800e-131ec9e08762_286b2c85-59b9-4e90-a388-3739308d71e1";

    // Track full page mouse movement
    window.addEventListener("mousemove", () => {
        lastMoveTime = Date.now();
    });

    // Optional: also track click/touch to reset
    window.addEventListener("click", () => { lastMoveTime = Date.now(); });
    window.addEventListener("touchstart", () => { lastMoveTime = Date.now(); });

    // Loop to detect moving / stopped cursor
    setInterval(() => {
        const diff = Date.now() - lastMoveTime;

        if (diff < CHECK_INTERVAL) {
            // User moving
            movingSeconds++;
            stoppedSeconds = 0;
            // If key was removed before and user moved again, no need to remove key
            console.log("cursor moving:", movingSeconds + "s");
        } else {
            // User idle
            stoppedSeconds++;
            movingSeconds = 0;
            console.log("cursor stopped:", stoppedSeconds + "s");

            if (stoppedSeconds >= IDLE_LIMIT) {
                console.log("⚠️ User idle 1 minute - clearing localStorage & redirecting");

                // Remove specific localStorage key
                localStorage.removeItem(LOCAL_KEY);

                // Redirect to home page
                window.location.href = "/";
            }
        }
    }, CHECK_INTERVAL);
})();
</script>