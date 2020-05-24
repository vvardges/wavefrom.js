createPolygon = (points, color, delta) => {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("fill", color);
    polygon.setAttribute("opacity", "0.5");

    const complexArray = [];
    for (let i = 0; i < points.length; i++) {
        complexArray.push(i*7+delta[0] + "," + (delta[1] + points[i]*50+1));
    }
    for (let i = points.length - 2; i > 0; i--) {
        complexArray.push(i*7+delta[0] + "," + (delta[1] - points[i]*50));
    }
    const pointsStr = complexArray.join(" ");

    polygon.setAttribute("points",pointsStr);

    return polygon;
};

createWave = (jsonData) => {
    console.log(jsonData.length);
    const svg = document.getElementById("svg");
    const colors = ["rgb(255, 228, 190)", "rgb(240, 157, 178)", "rgb(118, 161, 196)", "rgb(110, 121, 163)"];
    for (let i = 0; i < 3; i++) {
        const polygon = createPolygon(theSecret(jsonData), colors[i], [0, 40]);
        svg.appendChild(polygon);
    }
};

theSecret = (data) => {
    const filteredData = [];
    for (let i = 0; i < data.length; i += Math.floor(Math.random() * 5)) {
        filteredData.push(data[i]);
    }
    console.log(filteredData);
    return filteredData;
};

const jsonData = [26,20,16,16,14,18,14,18,15,38,39,30,40,41,35,35,40,38,30,42,36,37,33,28,30,32,35,33,43,36,36,39,36,29,43,32,39,25,22,21,23,24,19,17,22,21,20,17,29,24,23,30,41,32,33,35,38,39,28,35,37,37,40,36,37,33,33,32,32,30,33,30,37,37,33,35,38,35,35,31,35,35,29,26,31,30,27,30,28,30,30,27,27,37,43,35,39,36,40,35,38,41,45,37,40,34,42,39,41,39,30,37,43,35,39,47,32,33,37,34,36,36,41,40,38,38,34,34,32,35,39,40,36,38,35,37,38,32,33,32,27,30,26,32,34,29,40,36,30,38,32,38,40,34,35,37,32,36,50,39,29,34,35,38,35,40,43,38,35,41,37,36,36,35,31,30,34,23,21,34,32,26,31,35,31,25,27,34,28,32,29,29,30,28,42,36,36,31,35,38,31,31,36,34,29,32,37,28,32,29,28,29,29,31,36,29,28,34,34,29,49,29,38,25,29,26,29,36,41,40,33,38,48,50,29,27,37,38,35,45,27,32,45,31,28,41,39,39,32,36,41,42,32,32,33,37,36,48,28,40,38,27,33,37,38,32,31,35,26,29,35,34,25,32,17,18,29,16,22,14,19,18,15,13,18,59];
//createWave(jsonData);

// Set up audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

/**
 * Retrieves audio from an external source, the initializes the drawing function
 * @param {String} url the url of the audio we'd like to fetch
 */
const drawAudio = url => {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const data = normalizeData(filterData(audioBuffer));
            draw(data);
            createWave(data);
        });
};

/**
 * Filters the AudioBuffer retrieved from an external source
 * @param {AudioBuffer} audioBuffer the AudioBuffer from drawAudio()
 * @returns {Array} an array of floating point numbers
 */
const filterData = audioBuffer => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    console.log(rawData);
    const samples = 300; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
};

/**
 * Normalizes the audio data to make a cleaner illustration
 * @param {Array} filteredData the data from filterData()
 * @returns {Array} an normalized array of floating point numbers
 */
const normalizeData = filteredData => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

/**
 * Draws the audio file into a canvas element.
 * @param {Array} normalizedData The filtered array returned from filterData()
 * @returns {Array} a normalized array of data
 */
const draw = normalizedData => {
    console.log(normalizedData);
    // set up the canvas
    const canvas = document.querySelector("canvas");
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.translate(0, canvas.offsetHeight / 2 + padding); // set Y = 0 to be in the middle of the canvas

    // draw the line segments
    const width = canvas.offsetWidth / normalizedData.length;
    for (let i = 0; i < normalizedData.length; i++) {
        const x = width * i;
        let height = normalizedData[i] * canvas.offsetHeight - padding;
        if (height < 0) {
            height = 0;
        } else if (height > canvas.offsetHeight / 2) {
            height = height > canvas.offsetHeight / 2;
        }
        drawLineSegment(ctx, x, height, width, (i + 1) % 2);
    }
};

/**
 * A utility function for drawing our line segments
 * @param {AudioContext} ctx the audio context
 * @param {number} x  the x coordinate of the beginning of the line segment
 * @param {number} height the desired height of the line segment
 * @param {number} width the desired width of the line segment
 * @param {boolean} isEven whether or not the segmented is even-numbered
 */
const drawLineSegment = (ctx, x, height, width, isEven) => {
    ctx.lineWidth = 1; // how thick the line is
    ctx.strokeStyle = "#fff"; // what color our line is
    ctx.beginPath();
    height = isEven ? height : -height;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.arc(x + width / 2, height, width / 2, Math.PI, 0, isEven);
    ctx.lineTo(x + width, 0);
    ctx.stroke();
};

drawAudio('https://vvardges.github.io/bluedotstemeditor/assets/audio/erast/04_Erast_Harp.mp3');