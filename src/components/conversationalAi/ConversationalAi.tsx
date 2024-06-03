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
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import EmojiTalker from "../talkingEmoji/emoji";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const [currentAiMessage, setCurrentAiMessage] = useState<string>("");
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
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

    socketInstance.on("transcript", (data: any) => {
      setMessages((messages) => [
        ...messages,
        {
          by: "You",
          content: data,
        },
      ]);
    });

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

      // @ts-ignore
      audioRef.current.src = audioUrl;

      setSpeaking(true);
      // setRecord(false);

      // @ts-ignore
      audioRef.current.play();

      // @ts-ignore
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
      <>
        <button
          onClick={() => {
            setStarted(true);
            socket?.emit("start-interview", {
              userInterviewId: userInterviewId,
            });
          }}
        >
          Start Interview
        </button>
      </>
    );
  }

  return (
    <>
      <div className="w-full p-6 text-center flex flex-row justify-center items-center">
        <div className="w-full h-full flex flex-col justify-between items-stretch">
          <EmojiTalker
            className="h-[80vh]"
            phrase={"phrase"}
            speaking={speaking}
            onAnimationEnd={handleAnimationEnd}
          />
          <div className="w-full p-6 text-center flex flex-row justify-center items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Change Input device</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  changes might take a few secs to take effect
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
                    if (newDevice?.deviceId)
                      changeMediaDevice(newDevice?.deviceId);
                  }}
                >
                  {mediaDevices.map((device) => {
                    return (
                      <DropdownMenuRadioItem
                        key={device.deviceId}
                        value={device.label}
                      >
                        {device.label}
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    onClick={() => {
                      setRecord(!record);
                    }}
                    type="button"
                    className="w-[5vw] px-5"
                  >
                    {!record ? (
                      <FaMicrophone size={42} />
                    ) : (
                      <FaMicrophoneSlash size={42} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{record ? "Recording" : "Muted"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <audio ref={audioRef} />
          </div>
        </div>

        <div className="w-full p-6 text-center flex flex-col justify-center items-center">
          {messages.map((message, index) => {
            return (
              <Card key={index} className="m-2">
                <CardHeader>
                  <CardTitle>{message.by}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{message.content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => {
          socket?.emit("end-interview");

          window.location.href = `/${interviewId}/${userInterviewId}/feedback`;
        }}
      >
        End Interview
      </button>
    </>
  );
};
