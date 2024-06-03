const emojiMap = {
  "😮": ["o", "e", "d", "l", "q", "u", "w", "y", "a", "i"],
  "😐": ["b", "p", "m", "c", "g", "j", "k", "n", "r", "s", "t", "v", "x", "z"],
  "🙂": [""],
  "😲": [""],
  "😯": [""],
  "😀": [""],
};
const defaultEmoji = "😐";

export const toEmoji = (char: string) => {
  return (
    Object.keys(emojiMap).find((emoji) =>
      emojiMap[emoji as keyof typeof emojiMap].includes(char?.toLowerCase())
    ) || defaultEmoji
  );
};
