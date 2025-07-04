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

        async function setup(){

            try {
                const audioCtx = new AudioContext(); // Create AudioContext object (required for Web Audio API)

                // Request permission to use mic (and wait)
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});

                const source = audioCtx.createMediaStreamSource(stream);
                analyser = audioCtx.createAnalyser(); // Create AudioNode object that tracks audio data
                analyser.fftSize = 2048; // Fast Fourier Transform size (aka how many samples to take of audio per frame)

                bufferLength = analyser.frequencyBinCount; // Half the size of fftSize bcs the waves are mirrored horizontally
                dataArray = new Uint8Array(bufferLength); // Create array of bytes (0-255) of length bufferLength
                analyser.getByteTimeDomainData(dataArray); // Copy the audio wave values into the array

                // Connect the source to be analyzed
                source.connect(analyser);

                // Get a canvas defined with ID "oscilloscope"
                canvas = document.getElementById("oscilloscope");
                // Get drawing API for 2d canvas
                canvasCtx = canvas.getContext("2d");
                draw();

            }
            catch (err){
                console.error('Microphone access denied or error:', err);
            }
        }

        // Draw an oscilloscope of the current audio source
        function draw() {
            requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            // I think I will move this styling into somewhere else? Not sure yet.
            canvasCtx.fillStyle = "rgb(200 200 200)";
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "rgb(0 0 0)";

            canvasCtx.beginPath();

            const sliceWidth = (canvas.width * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

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

export default MicOscilloscope;
