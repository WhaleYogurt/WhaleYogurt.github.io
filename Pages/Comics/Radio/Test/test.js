document.addEventListener("DOMContentLoaded", function() {
    const playButton = document.getElementById('playButton');
    const audio = document.getElementById('audio');
    const canvas = document.getElementById('waveform');
    const canvasCtx = canvas.getContext('2d');
    let audioContext, analyser, sourceNode;
    let isPlaying = false;

    // Initialize Web Audio API for waveform visualization
    function initializeAudioContext() {
        console.log("Initializing AudioContext...");
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            console.log("AudioContext and Analyser initialized.");
        }
    }

    function connectSourceToAnalyser() {
        console.log("Connecting source to analyser...");
        if (sourceNode) {
            sourceNode.disconnect();
        }
        sourceNode = audioContext.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        sourceNode.connect(audioContext.destination);
        console.log("Source connected to analyser.");
    }

    function drawWaveform() {
        if (!isPlaying) return;

        requestAnimationFrame(drawWaveform);
        
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if(i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

    function togglePlay() {
        if (isPlaying) {
            console.log("Pausing audio...");
            audio.pause();
            playButton.textContent = 'Play';
            playButton.classList.remove('on');
            playButton.classList.add('off');
        } else {
            console.log("Playing audio...");
            initializeAudioContext();
            connectSourceToAnalyser();
            audio.play().then(() => {
                console.log("Audio started playing.");
                drawWaveform();
            }).catch(error => {
                console.error("Error starting audio playback:", error);
            });
            playButton.textContent = 'Pause';
            playButton.classList.remove('off');
            playButton.classList.add('on');
        }
        isPlaying = !isPlaying;
    }

    playButton.addEventListener('click', togglePlay);

    audio.addEventListener('play', () => {
        console.log("Audio playing...");
    });

    audio.addEventListener('pause', () => {
        console.log("Audio paused...");
    });

    audio.addEventListener('ended', () => {
        console.log("Audio ended...");
        playButton.textContent = 'Play';
        playButton.classList.remove('on');
        playButton.classList.add('off');
        isPlaying = false;
    });
});
