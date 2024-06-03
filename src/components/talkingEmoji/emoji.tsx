import React, { useState, useEffect, useRef } from "react";
import "@/components/talkingEmoji/style.css";

interface EmojiTalkerProps {
  phrase: string;
  speaking: boolean;
  onAnimationEnd: () => void;
  className: string;
}

const EmojiTalker: React.FC<EmojiTalkerProps> = ({
  phrase,
  speaking,
  onAnimationEnd,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (speaking) {
      intervalRef.current = window.setInterval(handleAnimation, 20);
    } else {
      setCurrentIndex(0);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [speaking]);

  const handleAnimation = () => {
    if (currentIndex < phrase.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      setCurrentIndex(0);
      onAnimationEnd();
    }
  };

  return (
    <div className={"emogif " + className}>
      <div>
        <span className="emogif__face">{speaking ? "😮" : "🙂"}</span>
      </div>
    </div>
  );
};

export default EmojiTalker;
