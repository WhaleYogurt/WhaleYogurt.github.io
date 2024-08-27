document.addEventListener("DOMContentLoaded", function() {
    const frequencySlider = document.getElementById('frequency');
    const frequencyInput = document.getElementById('frequency-input');
    const frequencyLabel = document.getElementById('frequency-label');
    const setFrequencyButton = document.getElementById('set-frequency');
    const strengthIndicator = document.getElementById('strength-indicator');
    const staticAudio = document.getElementById('static');
    const channel1Audio = document.getElementById('channel1');
    const channel2Audio = document.getElementById('channel2');
    const channelLog = document.getElementById('channel-log');
    const powerSwitch = document.getElementById('power-switch');
    const channelNameDisplay = document.getElementById('channel-name');
    const canvas = document.getElementById('waveform');
    const canvasCtx = canvas.getContext('2d');

    let currentChannel = null;
    let channelTimer = null;
    const channelLogSet = new Set();
    let isRadioOn = false;
    let audioContext, analyser, sourceNode;
    
    // Initialize Web Audio API for waveform visualization
    function initializeAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
        }
    }
    
    function connectSourceToAnalyser(audioElement) {
        if (sourceNode) {
            sourceNode.disconnect();
        }
        sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(analyser);
        sourceNode.connect(audioContext.destination);
    }

    function drawWaveform() {
        if (!isRadioOn) return; // Stop drawing if the radio is off

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

    // Play all channels at 0% volume initially
    staticAudio.volume = 1.0;
    channel1Audio.volume = 0.0;
    channel2Audio.volume = 0.0;

    // Function to handle frequency change
    function handleFrequencyChange() {
        const frequency = parseFloat(frequencySlider.value);
        frequencyLabel.textContent = `Frequency: ${frequency.toFixed(1)} MHz`;
        frequencyInput.value = frequency.toFixed(1);

        // Reset volumes
        staticAudio.volume = 1.0;
        channel1Audio.volume = 0.0;
        channel2Audio.volume = 0.0;

        // Adjust volumes based on proximity to the channel frequency
        const channelName = adjustVolume(frequency, 90.1, channel1Audio) || adjustVolume(frequency, 95.1, channel2Audio) || "Static";
        channelNameDisplay.value = channelName;

        // Connect the audio source to the analyser
        if (channelName === "Static") {
            connectSourceToAnalyser(staticAudio);
        } else if (channelName === "Channel 90.1") {
            connectSourceToAnalyser(channel1Audio);
        } else if (channelName === "Channel 95.1") {
            connectSourceToAnalyser(channel2Audio);
        }

        // Update strength indicator based on the current channel's volume
        updateStrengthIndicator(channel1Audio, channel2Audio);

        // Start or reset the channel timer
        const newChannel = getCurrentChannel(frequency);
        if (newChannel !== currentChannel) {
            currentChannel = newChannel;
            if (channelTimer) {
                clearTimeout(channelTimer);
            }
            if (currentChannel) {
                channelTimer = setTimeout(logCurrentChannel, 3000); // Change to 3 seconds
            }
        }
    }

    // Function to adjust volume based on proximity
    function adjustVolume(currentFreq, targetFreq, channelAudio) {
        const distance = Math.abs(currentFreq - targetFreq);
        if (distance <= 0.1) {
            staticAudio.volume = 0.0;
            channelAudio.volume = 1.0;
            return `Channel ${targetFreq.toFixed(1)}`;
        } else if (distance <= 0.2) {
            staticAudio.volume = 1.0 - (5 * (distance - 0.1)); // Linear decrease within 0.1 to 0.2 range
            channelAudio.volume = 1.0 - (5 * (distance - 0.1)); // Linear decrease within 0.1 to 0.2 range
            return `Channel ${targetFreq.toFixed(1)}`;
        }
        return null;
    }

    // Function to update the strength indicator
    function updateStrengthIndicator(channel1Audio, channel2Audio) {
        const strength = Math.max(channel1Audio.volume, channel2Audio.volume);
        strengthIndicator.style.width = `${strength * 100}%`;
    }

    // Function to get the current channel based on frequency
    function getCurrentChannel(frequency) {
        if (Math.abs(frequency - 90.1) <= 0.2) {
            return 'Channel 1';
        } else if (Math.abs(frequency - 95.1) <= 0.2) {
            return 'Channel 2';
        } else {
            return null;
        }
    }

    // Function to log the current channel
    function logCurrentChannel() {
        if (currentChannel && !channelLogSet.has(currentChannel)) {
            channelLogSet.add(currentChannel);
            const logEntry = document.createElement('li');
            logEntry.textContent = `${currentChannel} tuned at ${new Date().toLocaleTimeString()}`;
            channelLog.appendChild(logEntry);
        }
    }

    // Function to start all audio elements after user interaction
    function startAudio() {
        staticAudio.play();
        channel1Audio.play();
        channel2Audio.play();
        document.removeEventListener('click', startAudio); // Remove the event listener after interaction
    }

    // Function to toggle radio power
    function toggleRadioPower() {
        if (isRadioOn) {
            staticAudio.pause();
            channel1Audio.pause();
            channel2Audio.pause();
            powerSwitch.textContent = "OFF";
            powerSwitch.style.backgroundColor = "red";
            canvas.style.display = "none"; // Hide the canvas when radio is off
            isRadioOn = false;
        } else {
            initializeAudioContext();
            staticAudio.play();
            channel1Audio.play();
            channel2Audio.play();
            powerSwitch.textContent = "ON";
            powerSwitch.style.backgroundColor = "green";
            canvas.style.display = "block"; // Show the canvas when radio is on
            isRadioOn = true;
            drawWaveform();
        }
    }

    // Add event listener to the frequency slider
    frequencySlider.addEventListener('input', handleFrequencyChange);

    // Add event listener to the set frequency button
    setFrequencyButton.addEventListener('click', function() {
        const frequency = parseFloat(frequencyInput.value);
        if (frequency >= 88 && frequency <= 108) {
            frequencySlider.value = frequency;
            handleFrequencyChange();
        }
    });

    // Add event listener for user interaction to start audio playback
    document.addEventListener('click', startAudio);

    // Add event listener to the power switch
    powerSwitch.addEventListener('click', toggleRadioPower);

    // Initialize the display
    handleFrequencyChange();
});
