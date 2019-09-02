const classifier = knnClassifier.create();
const img_output =  document.getElementById('img-output');
const webcamElement = document.getElementById('webcam');

function loadFile(event){
  img_output.src = URL.createObjectURL(event.target.files[0]);
}

async function classifyImg(){
  console.log("Classify in progress...");
  const result = await net.classify(img_output);
  console.log("Classification completed");
  document.getElementById('answer').innerText = `
    Prediction: \n${result[0].className}\n
    Probability: \n${result[0].probability}\n
  `
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

async function loadApp(){
  // load the model
  console.log('Loading mobilenet...');
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');
  await setupWebcam();
  // make a prediction through the model on the uploaded img upon click
  document.getElementById('classify').addEventListener("click", classifyImg);
    // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-d').addEventListener('click', () => addExample(3));
  document.getElementById('class-e').addEventListener('click', () => addExample(4));


  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['Rock', 'Paper', 'Scissors','Lizzard','Spock'];
      document.getElementById('answer2').innerText = `
        Prediction: ${classes[result.classIndex]}\n
        Probability: ${result.confidences[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

loadApp();