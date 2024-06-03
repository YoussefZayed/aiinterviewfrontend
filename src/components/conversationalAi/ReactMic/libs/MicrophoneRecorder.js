/* eslint-disable */

let analyser;
let audioCtx;
let mediaRecorder;
let chunks = [];
let startTime;
let stream;
let mediaOptions;
let onStartCallback;
let onStopCallback;
let onSaveCallback;
let onDataCallback;
let constraints;
let deviceId;

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

export class MicrophoneRecorder {
  constructor(onStart, onStop, onSave, onData, options, soundOptions) {
    const {
      echoCancellation,
      autoGainControl,
      noiseSuppression,
      channelCount,
    } = soundOptions;

    onStartCallback = onStart;
    onStopCallback = onStop;
    onSaveCallback = onSave;
    onDataCallback = onData;
    mediaOptions = options;
    deviceId = "";

    constraints = {
      audio: {
        channelCount: 2,
      },
      video: false,
    };
  }

  setOnDataCallBack(onData) {
    onDataCallback = onData;
  }

  getMicrophoneDevices = async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === "audioinput");
  };

  getCurrentMicrophoneDevice = async () => {
    const devices = await this.getMicrophoneDevices();
    let curretnDevice;
    if (deviceId)
      curretnDevice = devices.find((device) => device.deviceId === deviceId);
    else curretnDevice = devices[0];
    return curretnDevice;
  };

  getMediaRecorder() {
    console.log("Constraints", constraints);
    navigator.mediaDevices.getUserMedia(constraints).then((str) => {
      console.log("MediaRecorder started", str);
      stream = str;

      if (MediaRecorder.isTypeSupported(mediaOptions.mimeType)) {
        mediaRecorder = new MediaRecorder(str, mediaOptions);
      } else {
        mediaRecorder = new MediaRecorder(str);
      }

      if (onStartCallback) {
        onStartCallback();
      }

      mediaRecorder.onstop = this.onStop;
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
        if (onDataCallback) {
          onDataCallback(event.data);
        }
      };
      import("./AudioContext").then((AudioContext) => {
        console.log("AudioContext", AudioContext.default);
        audioCtx = AudioContext.default.getAudioContext();
        audioCtx.resume().then(() => {
          analyser = AudioContext.default.getAnalyser();
          mediaRecorder.start(10);
          const sourceNode = audioCtx.createMediaStreamSource(stream);
          sourceNode.connect(analyser);
        });
      });
    });
  }

  setMicrophoneDevice = async (newDeviceId) => {
    deviceId = newDeviceId;

    constraints.audio.deviceId = { exact: deviceId };
    if (mediaRecorder) {
      console.log("replacing exisitng recorder");
      this.stopRecording();
      this.startRecording();
    }

    console.log("Updating microphone device");
  };

  startRecording = () => {
    startTime = Date.now();

    if (mediaRecorder) {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      if (mediaRecorder && mediaRecorder.state === "paused") {
        mediaRecorder.resume();
        return;
      }

      if (audioCtx && mediaRecorder && mediaRecorder.state === "inactive") {
        mediaRecorder.start(10);
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        if (onStartCallback) {
          onStartCallback();
        }
      }
    } else if (navigator.mediaDevices) {
      console.log("getUserMedia supported.");
      this.getMediaRecorder();
    } else {
      alert("Your browser does not support audio recording");
    }
  };

  stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();

      stream.getAudioTracks().forEach((track) => {
        track.stop();
      });
      mediaRecorder = null;
      AudioContext.resetAnalyser();
    }
  }

  onStop() {
    const blob = new Blob(chunks, { type: mediaOptions.mimeType });
    chunks = [];

    const blobObject = {
      blob,
      startTime,
      stopTime: Date.now(),
      options: mediaOptions,
      blobURL: window.URL.createObjectURL(blob),
    };

    if (onStopCallback) {
      onStopCallback(blobObject);
    }
    if (onSaveCallback) {
      onSaveCallback(blobObject);
    }
  }
}
