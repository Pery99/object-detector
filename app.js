const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const resultsDiv = document.getElementById("results");

async function setupCamera() {
  console.log("Setting up camera...");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      console.log("Camera ready!");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      resolve(video);
    };
  });
}

async function detectObjects() {
  console.log("Loading model...");
  const model = await cocoSsd.load();
  console.log("Model loaded!");
  await setupCamera();

  async function detectFrame() {
    const predictions = await model.detect(video);
    console.log("Predictions:", predictions);
    context.clearRect(0, 0, canvas.width, canvas.height);

    let resultsHTML = "<ul>";
    predictions.forEach((prediction) => {
      const { class: className, score, bbox } = prediction;
      const confidence = Math.round(score * 100);

      // Draw bounding box
      context.beginPath();
      context.rect(...bbox);
      context.lineWidth = 2;
      context.strokeStyle = "red";
      context.stroke();
      context.fillStyle = "white";
      context.fillText(
        `${className} (${confidence}%)`,
        bbox[0],
        bbox[1] > 10 ? bbox[1] - 5 : 10
      );

      // Add to results list
      resultsHTML += `<li>${className} (${confidence}%)</li>`;
    });
    resultsHTML += "</ul>";
    resultsDiv.innerHTML = resultsHTML;

    requestAnimationFrame(detectFrame);
  }

  detectFrame();
}

detectObjects().catch((err) => console.error("Error:", err));
