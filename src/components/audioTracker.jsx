import React, { useEffect } from 'react';


/**
 * Takes microphone input and returns a canvas displaying an Oscilloscope of the audio volume
 * Base code taken from MDN Web Docs https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
 * @returns {JSX.Element}
 * @constructor
 */
function MicOscilloscope(){
    useEffect(() => {
        // Define vars
        let analyser;
        let bufferLength;
        let dataArray;
        let canvas;
        let canvasCtx;
        let WIDTH = 600, HEIGHT = 400;

        async function setup(){

            try {
                // Create AudioContext object (required for Web Audio API)
                // Request permission to use mic (and wait)
                // Create a stream to mic and set it to source
                const audioCtx = new AudioContext();
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                const source = audioCtx.createMediaStreamSource(stream);

                // Create AudioNode object that tracks audio data
                // Set Fast Fourier Transform size (aka how many samples to take of audio per frame)
                // Halve the size of fftSize bcs the waves are mirrored horizontally
                // Create array of floats of length bufferLength
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 2048;
                bufferLength = analyser.fftSize;
                dataArray = new Float32Array(bufferLength);

                // Connect the source (mic) to be analyzed
                source.connect(analyser);

                // Get a canvas defined with ID "oscilloscope"
                // Get drawing API for 2d canvas
                // Call draw function
                canvas = document.getElementById("oscilloscope");
                canvasCtx = canvas.getContext("2d");
                draw();

            }
            catch (err){
                console.error('Microphone access denied or error:', err);
            }
        }

        // Draw an oscilloscope of the current audio source
        function draw() {
            let drawVisual = requestAnimationFrame(draw);

            // Fill dataArray with the current audio waveform samples as floating-point values between -1.0 and 1.0
            analyser.getFloatTimeDomainData(dataArray);

            // I still think I am going to move the draw stuff else where?
            new RootMeanSquareToDecibel(dataArray);

            //Draw the canvas and the waveform
            canvasCtx.fillStyle = "rgb(200 200 200)";
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "rgb(0 0 0)";
            canvasCtx.beginPath();

            const sliceWidth = (WIDTH) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] * 200.0;
                const y = HEIGHT / 2 + v;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        }

        setup().catch(console.error);

    }, [])

    return <canvas id="oscilloscope" width={500} height={500}></canvas>
}

/**
 * Calculate RMS (Root Mean Square) of the samples in dataArray and convert it to decibel values
 * @param dataArray
 * @constructor
 */
function RootMeanSquareToDecibel(dataArray){
    // I also think this stuff should go elsewhere but I'm not sure where yet?

    let sumOfSquares = 0;

    for (let i = 0; i < dataArray.length; i++){
        sumOfSquares += dataArray[i] * dataArray[i];
    }
    let rms = Math.sqrt(sumOfSquares/dataArray.length);

    let dB = 20 * Math.log10(rms);
    console.log(dB);

}

export default MicOscilloscope;
