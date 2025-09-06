// home page code

import wixLocation from 'wix-location';

$w.onReady(function () {
    // Search button functionality
    $w('#button5').onClick(() => {
        let query = $w('#input1').value;
        if(query) {
            // Redirect to search-hoa page with query
            wixLocation.to(`/search-hoa?search=${encodeURIComponent(query)}`);
        }
    });

    // Counter function
    function animateCounter(element, start, end, duration) {
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.text = `${value}+`;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // Animate counters on page load
    animateCounter($w("#text53"), 0, 10000, 3000);   // 10+ Years Experience
    animateCounter($w("#text54"), 0, 1000, 2000);  // 500+ Accuracy Rate
    animateCounter($w("#text55"), 0, 100, 3000);  // 400+ Positive Reviews
});
