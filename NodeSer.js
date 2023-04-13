const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fetch = require("node-fetch");


// This method will save the binary content of the request as a file.
app.patch('/binary-upload', (req, res) => {
  const date = Date.now();
  req.pipe(fs.createWriteStream('./uploads/image' + date + '.jpg'));
  const path = './uploads/image' + date + '.jpg'
  res.end(path);
});

// This method will save a "photo" field from the request as a file.
app.patch('/multipart-upload', upload.single('photo'), (req, res) => {
  // You can access other HTTP parameters. They are located in the body object.
  console.log(req.body);
  res.end('OK');
});
app.get("/api", async (req, res) => {
  console.log("path: 2" + req.query.path);
  const path = req.query.path;
  console.log("path: 3" + path);
  const filename = path;
  const endpointId = "3384257207875928064";
  const project = "planar-rarity-381719";
  const location = "us-central1";
  const aiplatform = require("@google-cloud/aiplatform");
  const { instance, params, prediction } =
    aiplatform.protos.google.cloud.aiplatform.v1.schema.predict;

  // Imports the Google Cloud Prediction Service Client library
  const { PredictionServiceClient } = aiplatform.v1;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: "us-central1-aiplatform.googleapis.com",
  };

  // Instantiates a client
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  async function predictImageClassification() {
    // Configure the endpoint resource
    const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;

    const parametersObj = new params.ImageClassificationPredictionParams({
      confidenceThreshold: 0.1,
      maxPredictions: 5,
    });
    const parameters = parametersObj.toValue();

    const fs = require("fs");
    const image = fs.readFileSync(filename, "base64");
    const instanceObj = new instance.ImageClassificationPredictionInstance({
      content: image,
    });
    const instanceValue = instanceObj.toValue();

    const instances = [instanceValue];
    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);

    console.log("Predict image classification response");
    console.log(`\tDeployed model id : ${response.deployedModelId}`);
    const predictions = response.predictions;
    console.log("\tPredictions :");
    var stringList = [];
    for (const predictionValue of predictions) {
      const predictionResultObj =
        prediction.ClassificationPredictionResult.fromValue(predictionValue);
      for (const [i, label] of predictionResultObj.displayNames.entries()) {
        console.log(`\tDisplay name: ${label}`);
        console.log(`\tConfidences: ${predictionResultObj.confidences[i]}`);
        console.log(`\tIDs: ${predictionResultObj.ids[i]}\n\n`);
        // stringList +=
        //   `\tDisplay name: ${label}` +
        //     `\tConfidences: ${predictionResultObj.confidences[i]}` +
        //     `\tIDs: ${predictionResultObj.ids[i]}\n\n`;
        stringList.push({
          id: predictionResultObj.ids[i],
          label: label,
          confidence: predictionResultObj.confidences[i],
          path: path
        });
        
      }
      res.send(
          stringList
      );
    }
    
  }
  predictImageClassification();

});


app.get("/api2", async (req, res) => {
  const filePath = `./src/screens/predictionList.json`;

  const appendDataToJsonFile = async (newData) => {
    try {
      const jsonData = await fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(jsonData);
      data.push(newData);
      const updatedData = JSON.stringify(data);
      await fs.writeFileSync(filePath, updatedData, 'utf8');
    } catch (error) {
      console.log("di",error);
    }
  };
  appendDataToJsonFile(req.query.data);
});



app.listen(5000, () => {
  console.log("running");
});
