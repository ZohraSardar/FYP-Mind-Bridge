import { useEffect } from 'react';

interface VoiceFeedbackProps {
  text: string;
  message: string;
  play: boolean;
  rate: number; // Add the rate property
}

export default function VoiceFeedback({ message, play }: VoiceFeedbackProps) {
  useEffect(() => {
    if (play && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  }, [message, play]);

  return null;
}
