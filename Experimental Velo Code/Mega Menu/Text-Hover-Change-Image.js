
$w.onReady(function () {
  const defaultImg = "https://i.postimg.cc/7GjZBMWq/pexels-pinamon-19251566.jpg";

  function bindHover(id, imgUrl) {
    if ($w(id) && typeof $w(id).onMouseIn === "function") {
      $w(id).onMouseIn(() => {
        $w("#previewImage").src = imgUrl;
      });
      $w(id).onMouseOut(() => {
        $w("#previewImage").src = defaultImg;
      });
    }
  }

  // Text item
  bindHover("#aboutText", "https://i.postimg.cc/7GjZBMWq/pexels-pinamon-19251566.jpg");
  bindHover("#servicesButton", "https://i.postimg.cc/06WQSqGM/Whats-App-Image-2025-09-02-at-01-48-48-4e69fff5.jpg");
  bindHover("#portfolioLink", "https://i.postimg.cc/Y4q0jSFB/Whats-App-Image-2025-09-02-at-01-48-49-fc997cc0.jpg");
});