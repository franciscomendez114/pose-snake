// Step 1: Define your data (x and y values for the line y = 2x)
const data = [];
// Generate more data points
for (let i = 0; i <= 50; i++) {
    const x = i;
    // Reduce random noise
    const y = x**3;
    data.push({ x:x, y:y});
}

const model = tf.sequential();

model.add(tf.layers.dense({
    inputShape: [1],
    units: 10,
    activation: 'relu'
}))
model.add(tf.layers.dense({
    units:10,
    activation: 'relu'
}))

model.add(tf.layers.dense({
    units: 1,
    activation: 'linear'
}));

model.compile({
    loss: 'meanSquaredError',
    optimizer: 'adam'
});
var inputs = [];
var outputs = [];

data.forEach(item => {
    inputs.push(item.x);
    outputs.push(item.y)
})

function normalize(data, min=Math.min(...data), max=Math.max(...data)){
    const res = [...data];
    for (let i = 0; i < data.length; i++){
        res[i] = (data[i]-min)/(max-min);
    }
    console.log(res);
    return res;
}

function unnormalize(data, min, max){
    for (let i = 0; i < data.length; i++){
        data[i] = data[i]*(max-min) + min;
    }
}


const inputTensor = tf.tensor1d(normalize(inputs), 'int32');
const outputTensor = tf.tensor1d(normalize(outputs), 'int32');


model.fit(inputTensor, outputTensor, {
    epochs: 500,
    batchSize: 10,
    callbacks:{
        onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1} - Loss: ${logs.loss}`);
          },
    },
    
}).then(() => {
    console.log('Finished Training');
    // const input = [10];
    // normalize(input, Math.min(...inputs), Math.max(...inputs));
    // const testInput = tf.tensor1d(input);
    // const prediction = [model.predict(testInput).dataSync()[0]];
    // unnormalize(prediction, Math.min(...outputs), Math.max(...outputs));
    // console.log(prediction[0]);
})

// Step 2: Create an ml5 Neural Network model
// const model = ml5.neuralNetwork({
//     task: 'regression',
//     debug: true,
//     layers: [
//       { type: 'dense', units: 8, activation: 'relu' },
//       { type: 'dense', units: 1, activation: 'linear'}
//     ],
//   });

// // Step 3: Add data to the model
// data.forEach(point => {
//   const input = { x: point.x };
//   const output = { y: point.y };
//   model.addData(input, output);
// });

// // Step 4: Normalize data and train the model
// const trainingOptions = {
//     epochs: 100,
//   };

// model.normalizeData();
// model.train(trainingOptions, finishedTraining);

// // Step 5: Callback function when training is finished
// function finishedTraining() {
//   console.log('Model training finished!');
//   // Step 6: Make predictions
//   const input = { x: 5 }; // Example input, you can change this
//   model.predict(input, (err, result) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log('Prediction:', result);
//     }
//   });
// }