export interface AudioProcessingResult {
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob;
}

const audioContext = new AudioContext();

function encodeWav(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numberOfChannels);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numberOfChannels); // byte rate
    setUint16(numberOfChannels * 2); // block align
    setUint16(16); // bits per sample

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    // Get channel data
    for (i = 0; i < numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    // Interleave channels
    while (pos < length) {
        for (i = 0; i < numberOfChannels; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF; // encode to 16-bit
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
}

export async function processAudioFromArrayBuffer(audioBuffer: ArrayBuffer, silenceThresholdDb: number): Promise<AudioProcessingResult> {
    const minSilenceDuration = 0.5; // seconds
    const paddingDuration = 0.1; // seconds

    try {
        const originalBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));

        const sampleRate = originalBuffer.sampleRate;
        const minSilenceSamples = minSilenceDuration * sampleRate;
        const paddingSamples = Math.floor(paddingDuration * sampleRate);

        const nonSilentSegments: { start: number; end: number }[] = [];
        let currentSegment: { start: number; end: number } | null = null;
        
        // For simplicity, we process the first channel
        const channelData = originalBuffer.getChannelData(0);
        const chunkSize = 2048;

        for (let i = 0; i < channelData.length; i += chunkSize) {
            const chunk = channelData.slice(i, i + chunkSize);
            let sumOfSquares = 0;
            for (const sample of chunk) {
                sumOfSquares += sample * sample;
            }
            const rms = Math.sqrt(sumOfSquares / chunk.length);
            const db = 20 * Math.log10(rms);

            if (db > silenceThresholdDb) {
                if (!currentSegment) {
                   currentSegment = { start: i, end: i + chunkSize };
                } else {
                   currentSegment.end = i + chunkSize;
                }
            } else {
                if (currentSegment) {
                   nonSilentSegments.push(currentSegment);
                   currentSegment = null;
                }
            }
        }
        if (currentSegment) nonSilentSegments.push(currentSegment);
        
        // Merge segments that are close together
        const mergedSegments: { start: number; end: number }[] = [];
        if (nonSilentSegments.length > 0) {
            let lastSegment = { ...nonSilentSegments[0] };
            for (let i = 1; i < nonSilentSegments.length; i++) {
                const current = nonSilentSegments[i];
                const silenceBetween = current.start - lastSegment.end;
                if (silenceBetween < minSilenceSamples) {
                    lastSegment.end = current.end;
                } else {
                    mergedSegments.push(lastSegment);
                    lastSegment = { ...current };
                }
            }
            mergedSegments.push(lastSegment);
        }

        if (mergedSegments.length === 0) {
           throw new Error("No audio detected above the silence threshold. Try a lower dB value.");
        }

        let totalLength = 0;
        for (const segment of mergedSegments) {
            totalLength += segment.end - segment.start + paddingSamples * 2;
        }

        const processedBuffer = audioContext.createBuffer(
            originalBuffer.numberOfChannels,
            totalLength,
            originalBuffer.sampleRate
        );

        let offset = 0;
        for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
            const originalChannelData = originalBuffer.getChannelData(i);
            const newChannelData = processedBuffer.getChannelData(i);
            offset = 0;
            for (const segment of mergedSegments) {
                const start = Math.max(0, segment.start - paddingSamples);
                const end = Math.min(originalBuffer.length, segment.end + paddingSamples);
                const segmentData = originalChannelData.subarray(start, end);
                newChannelData.set(segmentData, offset);
                offset += segmentData.length;
            }
        }

        const processedBlob = encodeWav(processedBuffer);
        
        const originalBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const originalUrl = URL.createObjectURL(originalBlob);
        const processedUrl = URL.createObjectURL(processedBlob);

        return { originalUrl, processedUrl, processedBlob };

    } catch (err) {
        throw new Error("Could not decode audio file. It may be corrupted or in an unsupported format.");
    }
}