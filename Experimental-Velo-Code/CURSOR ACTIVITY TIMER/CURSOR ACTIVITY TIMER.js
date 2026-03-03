<script>
// ================================
    // CURSOR ACTIVITY TIMER
    // Wix Body-End Safe
    // ================================

    (function() {
    // Only run in browser
    if (typeof window === "undefined") return;

    console.log("✅ Cursor tracker initialized (Body-End)");

    const CHECK_INTERVAL = 1000; // check every 1 second
    let lastMoveTime = Date.now();
    let movingSeconds = 0;
    let stoppedSeconds = 0;

    // Track full page mouse movement
    window.addEventListener("mousemove", () => {
        lastMoveTime = Date.now();
    });

    // Loop to detect moving / stopped cursor
    setInterval(() => {
        const diff = Date.now() - lastMoveTime;

    if (diff < CHECK_INTERVAL) {
        movingSeconds++;
    stoppedSeconds = 0;
    console.log("cursor moving:", movingSeconds + "s");
        } else {
        stoppedSeconds++;
    movingSeconds = 0;
    console.log("cursor stopped:", stoppedSeconds + "s");
        }
    }, CHECK_INTERVAL);
})();
</script>