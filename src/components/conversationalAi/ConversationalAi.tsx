"use client";

import type { FC } from "react";
import { Socket, io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import useMic from "@/components/conversationalAi/ReactMic/useMic";
import { FaMicrophone } from "react-icons/fa";
import { Circles } from "react-loader-spinner";
import EmojiTalker from "../talkingEmoji/emoji";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";

export type Props = {
  /** Set initial value */

  interviewId: string;
  userInterviewId: string;
};

type messages = {
  by: string;
  content: string;
};

export const ConversationalAi: FC<Props> = ({
  interviewId,
  userInterviewId,
}) => {
  const {
    record,
    setRecord,
    changeMediaDevice,
    mediaDevices,
    currentDevice,
    setOnDataCallBack,
  } = useMic({
    audioBitsPerSecond: 128000,
    mimeType: "audio/webm;codecs=opus",
    onStop: () => {
      console.log("Stopped");
    },
    onData: (data: Blob) => {
      sendVoice(data);
    },
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [messages, setMessages] = useState<messages[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentAiMessage, setCurrentAiMessage] = useState<string>("");
  const [speaking, setSpeaking] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_userName, setUserName] = useState<string>("");
  const [started, setStarted] = useState<boolean>(false);

  const getInterview = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/userinterviews/" + userInterviewId
      );

      const newUserInterview = response.data;

      setUserName(newUserInterview.name);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getInterview();
  }, []);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_BACKEND_URL);

    setSocket(socketInstance);
    socketInstance.on("connect", () => {
      console.log("Connected to server");
    });

    socketInstance.on("name-set", (name: string) => {
      setUserName(name);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketInstance.on("transcript", (data: any) => {
      setMessages((messages) => [
        ...messages,
        {
          by: "You",
          content: data,
        },
      ]);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketInstance.on("ai", (data: any) => {
      setCurrentAiMessage((prevMessage) => {
        const nextCurrentAiMessage = prevMessage + data.content;
        if (data.isDone) {
          setMessages((messages) => [
            ...messages,
            {
              by: "Susan",
              content: nextCurrentAiMessage,
            },
          ]);
          return "";
        }
        return nextCurrentAiMessage;
      });
    });

    socketInstance.on("aiVoice", (data) => {
      console.log("AI VOICE", data);
      // Create a new Blob from the received audio data
      const audioBlob = new Blob([data], { type: "audio/wav" });

      // Create a URL for the audio Blob
      const audioUrl = URL.createObjectURL(audioBlob);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      audioRef.current.src = audioUrl;

      setSpeaking(true);
      // setRecord(false);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      audioRef.current.play();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      audioRef.current.onended = () => {
        setSpeaking(false);
        setRecord(true);
      };
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      setOnDataCallBack(sendVoice);
    }
  }, [socket]);

  const sendVoice = (data: Blob) => {
    if (socket) socket.emit("packet-sent", data);
  };

  const handleAnimationEnd = () => {
    setSpeaking(false);
  };

  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Welcome to the Interview
            </CardTitle>
          </CardHeader>
          <CardDescription className="p-4">
            If the bottom right icon is spinning then just talk to respond to
            the interviewer.
          </CardDescription>
          <CardContent>
            <div className="space-y-6">
              <Button
                onClick={() => {
                  setStarted(true);
                  socket?.emit("start-interview", {
                    userInterviewId: userInterviewId,
                  });
                }}
                className="w-full"
              >
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <div className="grid grid-cols-2 gap-8 flex-grow overflow-y-auto">
        <div className="flex flex-col items-center justify-between">
          <EmojiTalker
            className="h-[80vh]"
            phrase={"phrase"}
            speaking={speaking}
            onAnimationEnd={handleAnimationEnd}
          />
        </div>

        <div className="flex flex-col space-y-4 overflow-y-auto">
          {messages.map((message, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{message.by}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{message.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Change Input Device</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>
              Changes might take a few seconds to take effect
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={
                mediaDevices.filter((device) => {
                  return device.deviceId === currentDevice?.deviceId;
                })[0]?.label
              }
              onValueChange={(label: string) => {
                const newDevice = mediaDevices.filter((device) => {
                  return device.label === label;
                })[0];
                if (newDevice?.deviceId) changeMediaDevice(newDevice?.deviceId);
              }}
            >
              {mediaDevices.map((device) => (
                <DropdownMenuRadioItem
                  key={device.deviceId}
                  value={device.label}
                >
                  {device.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={() => setRecord(!record)}
                variant={!record ? "destructive" : "default"}
              >
                {record ? (
                  <Circles
                    height="30"
                    width="80"
                    color="white"
                    ariaLabel="loading"
                  />
                ) : (
                  // <FaMicrophoneSlash className="h-6 w-6" />
                  <FaMicrophone className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{record ? "Recording" : "Muted"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <audio ref={audioRef} />

        <Button
          size="lg"
          onClick={() => {
            socket?.emit("end-interview");
            window.location.href = `/${interviewId}/${userInterviewId}/feedback`;
          }}
        >
          End Interview
        </Button>
      </div>
    </div>
  );
};
