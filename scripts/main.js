// Wait until the page is loaded
window.addEventListener("load", function () {
  // Set up camera parameters first
  setupCameraParameters();

  // Hide the loader when scene is loaded
  const scene = document.querySelector("a-scene");
  const loader = document.querySelector(".arjs-loader");

  scene.addEventListener("loaded", function () {
    loader.style.display = "none";
    // Adjust camera view after scene loads
    adjustCameraView();
    console.log("AR.js scene loaded");
  });

  // Add interactive features
  setupInteractions();
  // Add debugging for markers
  setupMarkerDebugging();
});

// Function to adjust camera settings
function adjustCameraView() {
  // Get the scene element
  const scene = document.querySelector("a-scene");

  // Update AR.js camera parameters
  const arjsSystem = scene.systems["arjs"];
  if (arjsSystem && arjsSystem.arController) {
    // Force camera to use a wider field of view
    arjsSystem.arController.cameraParam.deviceId = { exact: "environment" };

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

// Function to set up camera parameters
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

// Function to set up marker debugging
function setupMarkerDebugging() {
  // Debug marker detection
  const markers = document.querySelectorAll("a-marker");

  markers.forEach((marker) => {
    // Add visual indicator for marker detection
    const debugEntity = document.createElement("a-text");
    debugEntity.setAttribute("value", "Marker Detected!");
    debugEntity.setAttribute("position", "0 0 0");
    debugEntity.setAttribute("rotation", "-90 0 0");
    debugEntity.setAttribute("color", "green");
    debugEntity.setAttribute("align", "center");
    debugEntity.setAttribute("visible", "false");
    marker.appendChild(debugEntity);

    marker.addEventListener("markerFound", function () {
      console.log("Marker found:", marker.getAttribute("url"));
      debugEntity.setAttribute("visible", "true");

      // Update instructions
      document.querySelector("#instructions").innerHTML =
        "<p>✅ Marker detected! If you can't see 3D content, try adjusting your distance/angle.</p>" +
        "<button onclick='toggleSound()'>Toggle Sound</button>";

      // Check if 3D model is loaded
      const model =
        marker.querySelector("[obj-model]") ||
        marker.querySelector("[gltf-model]");
      if (model) {
        console.log("Model exists on marker");
      } else {
        console.log("No model found on marker");
      }
    });

    marker.addEventListener("markerLost", function () {
      console.log("Marker lost:", marker.getAttribute("url"));
      debugEntity.setAttribute("visible", "false");

      // Reset instructions
      document.querySelector("#instructions").innerHTML =
        "<p>Point camera at markers to see beach objects</p>" +
        "<p>Tap on objects to interact with them</p>" +
        "<button onclick='toggleSound()'>Toggle Sound</button>";
    });
  });
}

// Function to set up interactions with 3D objects
function setupInteractions() {
  // Make beach ball interactive (grows when clicked)
  const beachBall = document.querySelector(
    '[obj-model="obj: assets/models/beachball/13517_Beach_Ball_v2_L3.obj; mtl: assets/models/beachball/13517_Beach_Ball_v2_L3.mtl"]'
  );
  if (beachBall) {
    beachBall.addEventListener("click", function () {
      const currentScale = beachBall.getAttribute("scale");
      const newScale = `${currentScale.x * 1.2} ${currentScale.y * 1.2} ${
        currentScale.z * 1.2
      }`;
      beachBall.setAttribute("scale", newScale);

      // Return to original size after 2 seconds
      setTimeout(() => {
        beachBall.setAttribute("scale", "0.1 0.1 0.1");
      }, 2000);
    });
  } else {
    console.log("Beach ball entity not found for interaction setup");
  }

  // Add event for umbrella to change color when clicked
  const umbrella =
    document.querySelector(
      '[obj-model="obj: #beach-umbrella; mtl: #beach-umbrella-mtl"]'
    ) || document.querySelector('[gltf-model="#beach-umbrella"]');
  if (umbrella) {
    let colorIndex = 0;
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33"];

    umbrella.addEventListener("click", function () {
      colorIndex = (colorIndex + 1) % colors.length;
      umbrella.setAttribute("material", `color: ${colors[colorIndex]}`);
    });
  } else {
    console.log("Umbrella entity not found for interaction setup");
  }

  // Set up environment visibility toggling
  document.querySelectorAll("a-marker").forEach((marker) => {
    marker.addEventListener("markerFound", function () {
      document.querySelector("#environment").setAttribute("visible", "true");
    });

    marker.addEventListener("markerLost", function () {
      // Only hide if all markers are lost
      const visibleMarkers = Array.from(
        document.querySelectorAll("a-marker")
      ).filter((m) => m.object3D.visible);
      if (visibleMarkers.length === 0) {
        document.querySelector("#environment").setAttribute("visible", "false");
      }
    });
  });
}

// Listen for model loading errors and successes
document.addEventListener("DOMContentLoaded", function () {
  const sceneEl = document.querySelector("a-scene");

  // Handle model loading errors
  sceneEl.addEventListener("model-error", function (e) {
    console.error("Model failed to load", e.detail.src);
  });

  // Log when models load successfully
  sceneEl.addEventListener("model-loaded", function (e) {
    console.log("Model loaded successfully", e.target);
  });
});

// Function to toggle sound (defined globally so it can be called from HTML)
function toggleSound() {
  const sounds = document.querySelectorAll("a-sound");
  sounds.forEach((sound) => {
    if (sound.getAttribute("volume") > 0) {
      sound.setAttribute("volume", 0);
    } else {
      sound.setAttribute("volume", 1);
    }
  });
}
