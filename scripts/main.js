// In your main.js file, add this function to adjust camera settings
function adjustCameraView() {
  // Get the scene element
  const scene = document.querySelector("a-scene");

  // Update AR.js camera parameters
  const arjsSystem = scene.systems["arjs"];
  if (arjsSystem && arjsSystem.arController) {
    // Force camera to use a wider field of view
    arjsSystem.arController.cameraParam.deviceId = { exact: environment };

    // Additional camera adjustments
    const video = document.querySelector("video");
    if (video) {
      // Apply styles to video element to show more of the camera view
      video.style.objectFit = "cover";
      video.style.width = "100%";
      video.style.height = "100%";
    }
  }
}

// Add this to your main.js file
function setupCameraParameters() {
  // Try to access the webcam with specific constraints
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: "environment",
        zoom: 1.0, // Setting zoom to 1.0 (minimum zoom)
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        // Get video track
        const videoTrack = stream.getVideoTracks()[0];

        // Try to set zoom constraint if available
        if (
          videoTrack &&
          videoTrack.getCapabilities &&
          videoTrack.getCapabilities().zoom
        ) {
          const capabilities = videoTrack.getCapabilities();
          // Set to minimum zoom
          const settings = { zoom: capabilities.zoom.min };
          videoTrack
            .applyConstraints({ advanced: [settings] })
            .then(() => console.log("Camera zoom set to minimum"))
            .catch((e) => console.log("Could not set zoom: ", e));
        }
      })
      .catch(function (err) {
        console.log("Error accessing camera with constraints: ", err);
      });
  }
}

// Modify your existing window.addEventListener function
window.addEventListener("load", function () {
  setupCameraParameters();
  // Hide the loader when scene is loaded
  const scene = document.querySelector("a-scene");
  const loader = document.querySelector(".arjs-loader");

  scene.addEventListener("loaded", function () {
    loader.style.display = "none";
    // Add this line to call our new function
    adjustCameraView();
  });

  // Add interactive features
  setupInteractions();
});
