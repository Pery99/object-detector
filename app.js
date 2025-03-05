const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const controls = document.getElementById("controls");
let tryOnMode = "none";

// Load images for try-on (replace with real URLs or local paths)
const glassesImg = new Image();
glassesImg.src = "glasses.png"; // Placeholder - replace with real glasses PNG
const hatImg = new Image();
hatImg.src = "https://i.imgur.com/6Y6Y6Y6.png"; // Placeholder - replace with real hat PNG

function onResults(results) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (results.detections) {
    results.detections.forEach((detection) => {
      const keypoints = detection.landmarks;
      const leftEye = keypoints[1];
      const rightEye = keypoints[0];
      const nose = keypoints[2];

      if (tryOnMode === "glasses" && glassesImg.complete) {
        // Calculate eye angle for rotation
        const angle = Math.atan2(
          rightEye.y - leftEye.y,
          rightEye.x - leftEye.x
        );

        // Improved sizing calculations
        const eyeDistance = Math.hypot(
          leftEye.x - rightEye.x,
          leftEye.y - rightEye.y
        ) * canvas.width;
        const glassesWidth = eyeDistance * 2.2; // Adjusted scale factor
        const glassesHeight = glassesWidth * 0.35; // Adjusted aspect ratio

        // Improved positioning
        const centerX = (leftEye.x + rightEye.x) / 2 * canvas.width;
        const centerY = (leftEye.y + rightEye.y) / 2 * canvas.height;
        const glassesX = centerX - glassesWidth / 2;
        const glassesY = centerY - glassesHeight / 2;

        // Apply rotation transform
        context.save();
        context.translate(centerX, centerY);
        context.rotate(angle);
        context.drawImage(
          glassesImg,
          -glassesWidth / 2,
          -glassesHeight / 2,
          glassesWidth,
          glassesHeight
        );
        context.restore();

      } else if (tryOnMode === "hat" && hatImg.complete) {
        // Improved hat positioning and sizing
        const faceWidth = Math.hypot(
          leftEye.x - rightEye.x,
          leftEye.y - rightEye.y
        ) * canvas.width * 2.5;
        
        const hatWidth = faceWidth * 1.8;
        const hatHeight = hatWidth * 0.6;
        const hatX = nose.x * canvas.width - hatWidth / 2;
        const hatY = (nose.y * canvas.height) - hatHeight * 1.2; // Move hat higher up

        context.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
      }
    });
  }
}

async function setupApp() {
  console.log("Loading face detection...");
  const faceDetection = new FaceDetection({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
    },
  });

  faceDetection.setOptions({
    selfieMode: true,
    model: "short",
    minDetectionConfidence: 0.5,
  });

  faceDetection.onResults(onResults);

  const camera = new Camera(video, {
    onFrame: async () => {
      await faceDetection.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  await camera.start();
  console.log("Camera started!");
}

// Handle try-on mode selection
controls.addEventListener("change", (e) => {
  tryOnMode = e.target.value;
  console.log("Try-on mode:", tryOnMode);
});

setupApp().catch((err) => console.error("Error:", err));
