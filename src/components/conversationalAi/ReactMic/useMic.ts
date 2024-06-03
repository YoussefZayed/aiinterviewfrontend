import { useEffect, useState } from "react";

// @ts-ignore
import { MicrophoneRecorder } from "./libs/MicrophoneRecorder";

export type blobObject = {
  blob: Blob;
  startTime: number;
  stopTime: Date;
  options: {
    audioBitsPerSecond: number;
    mimeType: string;
  };
  blobURL: string;
};

type propTypes = {
  audioBitsPerSecond: number;
  mimeType: string;
  onStop?: (blob: blobObject) => void;
  onData?: (blob: Blob) => void;
  onSave?: (blob: blobObject) => void;
};

const useMic = ({
  audioBitsPerSecond,
  mimeType,
  onStop,
  onData,
  onSave,
}: propTypes) => {
  const [record, setRecord] = useState(false);
  const [microphoneRecorder, setMicrophoneRecorder] =
    useState<MicrophoneRecorder>(null);
  const [currentDevice, setCurrentDevice] = useState<MediaDeviceInfo | null>();
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const options = {
      audioBitsPerSecond,
      mimeType,
    };
    const soundOptions = {};

    if (!microphoneRecorder) {
      const microphoneRecorderObj = new MicrophoneRecorder(
        null,
        onStop,
        onSave,
        onData,
        options,
        soundOptions
      );
      setMicrophoneRecorder(microphoneRecorderObj);
      (async () => {
        const currentMic =
          await microphoneRecorderObj.getCurrentMicrophoneDevice();

        setCurrentDevice(currentMic);
        const currentDevices =
          await microphoneRecorderObj.getMicrophoneDevices();
        setMediaDevices(currentDevices);
      })();
    }
  }, []);

  useEffect(() => {
    if (!microphoneRecorder) {
      return;
    }
    if (record) {
      microphoneRecorder.startRecording();
    } else {
      microphoneRecorder.stopRecording();
    }
  }, [record]);

  async function changeMediaDevice(deviceId: string) {
    if (!microphoneRecorder) {
      console.warn("Media recorder not set up");
      return;
    }
    await microphoneRecorder.setMicrophoneDevice(deviceId);
    const currentMic = await microphoneRecorder.getCurrentMicrophoneDevice();
    setCurrentDevice(currentMic);
    const currentDevices = await microphoneRecorder.getMicrophoneDevices();
    setMediaDevices(currentDevices);
  }

  function setOnDataCallBack(onData: (blob: Blob) => void) {
    microphoneRecorder.setOnDataCallBack(onData);
  }

  return {
    record,
    setRecord,
    changeMediaDevice,
    mediaDevices,
    currentDevice,
    setOnDataCallBack,
  };
};

export default useMic;
