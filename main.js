/**
 * @copyright 2023 ArkjuniorK
 * This is an example how to train a neural network using ml5.js (https://ml5js.org/), many thanks to ml5.js team for this
 * helpful library and Winastwan Gora (https://www.kaggle.com/winastwangora) for the datasets which could
 * be viewed and downloaded here https://www.kaggle.com/datasets/winastwangora/proyeksi-jumlah-penduduk-indonesia-jenis-kelamin.
 *
 * TODO:
 * - Add interface to frontend [v]
 * - Deploy to Github Pages [v]
 *
 */

import provinces from "./provinces.js";

const formComponent = document.querySelector("#form");
const errorComponent = document.querySelector("#error-wrapper");
const readyComponent = document.querySelector("#ready")
const valueComponent = document.querySelector("#result-value")
const loadingComponent = document.querySelector("#loading")
const yearSelectorComponent = document.querySelector("#select-year")
const provinceSelectorComponent = document.querySelector("#select-province")

// options for ml5 neuralNetwork method
const options = {
    dataUrl: 'datasets.csv',
    task: 'regression',
    inputs: ['kode', 'tahun', 'kelamin'],
    outputs: ['jumlah'],
    debug: true, // TODO: disable this on deployment
}

// create neural network instance based on given
// options then execute the callback
const nn = ml5.neuralNetwork(options, dataLoaded)

/**
 * This is a callback that would be trigger
 * inside the neuralNetwork function that responsible with two things:
 * 1. Normalize input data
 * 2. Train the model
 */
function dataLoaded() {
    nn.normalizeData();
    trainModel();
}

/**
 * Train the model, specify the epochs and batchSize if necessary.
 * After training execute the doneTraining callback.
 */
function trainModel() {
    const trainOptions = { epochs: 59 };
    nn.train(trainOptions, doneTraining);
}

/**
 * This function would be trigger right after training the model.
 * In here all operation would primarily use to modify the DOM.
 */
function doneTraining() {
    // insert data into select components
    yearSelectorComponent.append(...getYears());
    provinceSelectorComponent.append(...getProvinces());

    // toggle components
    readyComponent.classList.toggle("d-none");
    loadingComponent.classList.toggle("d-none");
}


/**
 * Generate an array of option tag
 * for year selector up to 30 years forward.
 *
 * @returns {Node[]}
 */
function getYears() {
    const currentYear  = new Date(Date.now()).getFullYear()
    const yearLength   = 30;

    let yearOptions = [];
    let i = 0;

    while(i <= yearLength) {
        const year = currentYear + i
        const node = createOptionNode(year, year)
        yearOptions.push(node)
        i++;
    }

    return yearOptions
}

/**
 * Generate an array of option tag
 * for province selector
 *
 * @returns {Node[]}
 */
function getProvinces() {
    let provinceOptions = []

    for (const province of provinces) {
        const node = createOptionNode(province.provinsi, province.kode)
        provinceOptions.push(node)
    }

    return provinceOptions;
}


/**
 * Create an option node with its text and attribute.
 *
 * @param data {String|number}
 * @param value {String|number}
 * @returns {HTMLOptionElement}
 */
function createOptionNode(data, value) {
    const node= document.createElement("option");
    const text = document.createTextNode(data.toString());
    const attribute = document.createAttribute("value");

    attribute.value = value.toString();
    node.setAttributeNode(attribute);
    node.appendChild(text);

    return node;
}


formComponent.addEventListener('submit', onSubmit)

/**
 * Handle submit button action. It would get the value
 * of each input then combine it to inputs that ml5 would use to predict.
 *
 * @param e
 */
function onSubmit(e) {
    e.preventDefault();

    const year = parseInt(formComponent.elements["year"].value);
    const gender = parseInt(formComponent.elements["gender"].value);
    const province = parseInt(formComponent.elements["province"].value);

    const inputs = {'kode': province, 'tahun': year, 'kelamin': gender};
    nn.predict(inputs, handleResults);
}


/**
 * Handle the result of neural network prediction.
 * If an error is occurred then display the error message,
 * otherwise display the result.
 *
 * @param error
 * @param results
 */
function handleResults(error, results) {
   if (error) {
       console.error(error);
       const errorMessage = `Error: ${error}`

       valueComponent.classList.toggle("d-none");
       errorComponent.classList.toggle("d-none");
       errorComponent.innerHTML = errorMessage;

       return
   }

   const value = results[0].value.toFixed(0)
   valueComponent.innerHTML = value.toString()
}