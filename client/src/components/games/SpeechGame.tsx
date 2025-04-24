"use client";

import { useState, useEffect, useRef } from "react";
import type { GameMode } from "@shared/schema";
import GameLayout from "@/components/common/GameLayout";
import VoiceFeedback from "@/components/common/VoiceFeedback";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { FaSmile, FaSadTear, FaClock, FaTrophy, FaVolumeUp, FaRegLightbulb, FaStar } from "react-icons/fa";
import { useSpring, animated } from "@react-spring/web";
import { saveGameData } from "@/lib/firestore-utils";

interface SpeechGameProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const GESTURES = [
  {
    emoji: "👋",
    name: "Wave Hello",
    description: "Use this to greet someone.",
    steps: ["Raise your hand", "Move side to side"],
    color: "#FF5733",
    animation: { x: [0, 20, -20, 0], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "👍",
    name: "Thumbs Up",
    description: "Use this to show approval.",
    steps: ["Make a fist", "Lift your thumb"],
    color: "#33A1FF",
    animation: { scale: [1, 1.2, 1], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "❤️",
    name: "I Love You",
    description: "Use this to express love.",
    steps: ["Touch your chest", "Make a heart shape"],
    color: "#FF33A8",
    animation: { rotate: [0, -10, 10, 0], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "🤞",
    name: "Fingers Crossed",
    description: "Use this to wish for good luck.",
    steps: ["Raise your hand", "Cross your fingers"],
    color: "#33FF57",
    animation: { rotate: [0, 5, -5, 0], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "✌️",
    name: "Peace Sign",
    description: "Use this to show peace or victory.",
    steps: ["Raise your hand", "Extend two fingers"],
    color: "#FFFF33",
    animation: { scale: [1, 1.2, 1], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "🤙",
    name: "Call Me",
    description: "Use this to ask someone to call you.",
    steps: ["Raise your hand", "Make a phone shape"],
    color: "#FF5733",
    animation: { rotate: [0, 10, -10, 0], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "👌",
    name: "OK",
    description: "Use this to show approval or agreement.",
    steps: ["Make a circle with your thumb and index finger"],
    color: "#33A1FF",
    animation: { rotate: [0, 10, -10, 0], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "👏",
    name: "Clap",
    description: "Use this to show appreciation.",
    steps: ["Bring your palms together", "Clap your hands"],
    color: "#FF33A8",
    animation: { scale: [1, 1.2, 1], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "🤝",
    name: "Handshake",
    description: "Use this to greet or seal a deal.",
    steps: ["Extend your hand", "Grip the other person's hand"],
    color: "#33FF57",
    animation: { rotate: [0, -5, 5, 0], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "🙏",
    name: "Praying Hands",
    description: "Use this to show respect or gratitude.",
    steps: ["Bring your palms together", "Bow your head"],
    color: "#FFFF33",
    animation: { rotate: [0, 5, -5, 0], transition: { duration: 1, repeat: Infinity } },
  },
  {
    emoji: "🤗",
    name: "Hug",
    description: "Use this to show affection or comfort.",
    steps: ["Open your arms wide", "Wrap them around the other person"
    ],
    color: "#FF5733",
    animation: { rotate: [0, 10, -10, 0], transition: { duration: 1, repeat: Infinity } },
  },
  
];

const QUIZ_LEVELS = {
  easy: 5,
  medium: 8,
  hard: 10,
};

const DIFFICULTY_OPTIONS = {
  easy: { gesturesCount: 3, optionsCount: 2 },
  medium: { gesturesCount: 4, optionsCount: 3 },
  hard: { gesturesCount: 5, optionsCount: 4 },
};

export default function SpeechGame({ mode, onModeChange }: SpeechGameProps) {
  // Game state
  const [currentGesture, setCurrentGesture] = useState(GESTURES[0]);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [quizLevel, setQuizLevel] = useState<"easy" | "medium" | "hard">("easy");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [availableGestures, setAvailableGestures] = useState(GESTURES.slice(0, 3));
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [learningProgress, setLearningProgress] = useState<Record<string, number>>({});

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Animations
  const scoreAnimation = useSpring({ number: score, from: { number: 0 } });
  const timeAnimation = useSpring({ number: timeElapsed, from: { number: 0 } });

  // Initialize learning progress tracking
  useEffect(() => {
    const initialProgress: Record<string, number> = {};
    GESTURES.forEach((gesture) => {
      initialProgress[gesture.name] = 0;
    });
    setLearningProgress(initialProgress);
  }, []);

  // Setup based on difficulty level
  useEffect(() => {
    const { gesturesCount } = DIFFICULTY_OPTIONS[quizLevel];
    setAvailableGestures(GESTURES.slice(0, gesturesCount));
  }, [quizLevel]);

  // Generate quiz options
  const generateQuizOptions = () => {
    const { optionsCount } = DIFFICULTY_OPTIONS[quizLevel];
    const correctAnswer = currentGesture.name;

    const otherOptions = availableGestures
      .filter((gesture) => gesture.name !== correctAnswer)
      .map((gesture) => gesture.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, optionsCount - 1);

    setQuizOptions([correctAnswer, ...otherOptions].sort(() => 0.5 - Math.random()));
  };

  // Start timer for quiz mode
  useEffect(() => {
    if (mode === "quiz" && !gameOver && !timerInterval) {
      const interval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
      setTimerInterval(interval);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [mode, gameOver, timerInterval]);

  // Stop timer when game ends
  useEffect(() => {
    if (gameOver && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [gameOver, timerInterval]);

  // Generate quiz options when gesture changes
  useEffect(() => {
    if (mode === "quiz") {
      generateQuizOptions();
    }
  }, [currentGesture, mode, quizLevel]);

  // Check if quiz is completed and save data
  useEffect(() => {
    if (mode === "quiz" && questionCount >= QUIZ_LEVELS[quizLevel] && !isDataSaved) {
      setGameOver(true);
      setIsDataSaved(true);

      // Prepare game result
      const gameResult = {
        Age: parseInt(localStorage.getItem("age") || "0", 10),
        Email: localStorage.getItem("email") || "N/A",
        Game: "Gesture Recognition",
        Level: quizLevel,
        Name: localStorage.getItem("name") || "Guest",
        Score: score,
        TimeTaken: timeElapsed,
      };

      // Save game data to Firestore
      saveGameData(gameResult)
        .then(() => {
          console.log("Game data saved to Firestore!");
        })
        .catch((error) => {
          console.error("Failed to save game data:", error);
        });
    }
  }, [questionCount, mode, quizLevel, score, timeElapsed, isDataSaved]);

  // Celebration effects
  useEffect(() => {
    if (showCelebration) {
      triggerConfetti();
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
  }, [showCelebration]);

  // Trigger confetti for correct answers
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FFA500", "#FF4500"],
    });
  };

  // Play sound effect
  const playSound = (isCorrect: boolean) => {
    if (audioRef.current) {
      audioRef.current.src = isCorrect ? "/sounds/correct.mp3" : "/sounds/incorrect.mp3";
      audioRef.current.play().catch((e) => console.log("Audio play failed:", e));
    }
  };

  // Speak function for text-to-speech
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  // Handle gesture selection
  const handleGestureSelect = (selectedGesture: string) => {
    if (disabled || gameOver) return;

    const isCorrect = selectedGesture === currentGesture.name;

    // Update learning progress
    if (isCorrect) {
      setLearningProgress((prev) => ({
        ...prev,
        [currentGesture.name]: Math.min((prev[currentGesture.name] || 0) + 1, 5),
      }));

      setConsecutiveCorrect((prev) => prev + 1);
      setStreak((prev) => prev + 1);

      // Celebrate streaks
      if (streak > 0 && streak % 3 === 0) {
        setShowCelebration(true);
      }
    } else {
      setConsecutiveCorrect(0);
      setStreak(0);
    }

    // Prepare feedback message
    const feedbackMessage = isCorrect
      ? `Great job! This is a ${currentGesture.name}! ${currentGesture.description}`
      : `Let's try again! This is a ${currentGesture.name}. ${currentGesture.description}`;

    setFeedback({
      correct: isCorrect,
      message: feedbackMessage,
    });

    // Visual and audio feedback
    if (isCorrect) {
      if (mode === "quiz") triggerConfetti();
      playSound(true);
      setScore((prevScore) => prevScore + 1);
      setCorrectAnswers((prev) => prev + 1);
    } else {
      playSound(false);
    }

    setDisabled(true);

    // Always increment question count
    setQuestionCount((prevCount) => prevCount + 1);

    // Progress to next question after delay
    setTimeout(() => {
      setFeedback(null);
      setShowHint(false);

      if (!gameOver) {
        // In quiz mode, always show a new random gesture
        let newGesture;
        do {
          newGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)];
        } while (newGesture.name === currentGesture.name);
        setCurrentGesture(newGesture);

        setDisabled(false);
      }
    }, 3000);
  };

  // Reset the game
  const resetGame = () => {
    setQuestionCount(0);
    setScore(0);
    setCorrectAnswers(0);
    setConsecutiveCorrect(0);
    setGameOver(false);
    setTimeElapsed(0);
    setIsDataSaved(false);
    setStreak(0);

    // Start with a random gesture for quiz mode
    setCurrentGesture(availableGestures[Math.floor(Math.random() * availableGestures.length)]);

    if (mode === "quiz") generateQuizOptions();
  };

  // Pronounce gesture details in learning mode
  useEffect(() => {
    if (mode === "practice") {
      const gesture = currentGesture;
      const text = `${gesture.name}. ${gesture.description}. Steps: ${gesture.steps.join(". ")}`;
      speak(text);
    }
  }, [currentGesture, mode]);

  // Pronounce quiz question in quiz mode
  useEffect(() => {
    if (mode === "quiz") {
      const text = `What gesture is this? ${currentGesture.description}`;
      speak(text);
    }
  }, [currentGesture, mode]);

  return (
    <GameLayout title="Gesture Recognition" mode={mode} onModeChange={onModeChange}>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Practice and Quiz Mode Buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <Button
            variant={mode === "practice" ? "default" : "outline"}
            onClick={() => {
              onModeChange("practice");
              resetGame();
            }}
            className={`text-white ${mode === "practice" ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 hover:bg-gray-500"}`}
          >
            <FaRegLightbulb className="mr-2" /> Learning Mode
          </Button>
          <Button
            variant={mode === "quiz" ? "default" : "outline"}
            onClick={() => {
              onModeChange("quiz");
              resetGame();
            }}
            className={`text-white ${mode === "quiz" ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-400 hover:bg-gray-500"}`}
          >
            <FaTrophy className="mr-2" /> Quiz Mode
          </Button>
        </div>

        {/* Learning Mode */}
        {mode === "practice" && (
          <Card className="p-6 bg-white shadow-lg rounded-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentGesture.name}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                {/* Gesture display */}
                <motion.div
                  className="text-8xl mb-4 p-6 mx-auto"
                  style={{ color: currentGesture.color }}
                  animate={currentGesture.animation}
                >
                  {currentGesture.emoji}
                </motion.div>

                {/* Gesture name and description */}
                <div className="text-2xl font-bold mb-4 text-blue-900">
                  {currentGesture.name}
                </div>
                <div className="text-lg mb-4 text-gray-700">
                  {currentGesture.description}
                </div>

                {/* Steps to perform the gesture */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold mb-2">How to do it:</h3>
                  <ol className="list-decimal list-inside text-left">
                    {currentGesture.steps.map((step, index) => (
                      <li key={index} className="mb-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Next gesture button */}
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    const currentIndex = availableGestures.findIndex(
                      (g) => g.name === currentGesture.name
                    );
                    const nextIndex = (currentIndex + 1) % availableGestures.length;
                    setCurrentGesture(availableGestures[nextIndex]);
                  }}
                >
                  Next Gesture
                </Button>
              </motion.div>
            </AnimatePresence>
          </Card>
        )}

        {/* Quiz Mode */}
        {mode === "quiz" && (
          <>
            {/* Quiz Mode Controls */}
            <div className="bg-purple-100 rounded-lg p-4 mb-4">
              <div className="flex justify-center items-center gap-6 mb-4">
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
                  <FaTrophy className="text-yellow-500 text-2xl" />
                  <animated.div className="text-green-500 font-bold text-xl">
                    {scoreAnimation.number.to((n: number) => Math.floor(n))}
                  </animated.div>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
                  <FaClock className="text-blue-500 text-2xl" />
                  <animated.div className="text-blue-500 font-bold text-xl">
                    {timeAnimation.number.to((n: number) => Math.floor(n))}
                  </animated.div>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                {(["easy", "medium", "hard"] as const).map((lvl) => (
                  <Button
                    key={lvl}
                    onClick={() => {
                      setQuizLevel(lvl);
                      resetGame();
                    }}
                    variant={quizLevel === lvl ? "default" : "outline"}
                    className={`min-w-[100px] ${
                      quizLevel === lvl
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quiz Mode Main Area */}
            <Card className="p-6 bg-white shadow-lg rounded-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGesture.name + questionCount}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  {/* Quiz question */}
                  <div className="text-2xl mb-6 text-blue-900 font-bold">
                    What gesture is this? {currentGesture.description}
                  </div>

                  {/* Options grid - select gestures */}
                  <div className={`grid grid-cols-${DIFFICULTY_OPTIONS[quizLevel].optionsCount} gap-4`}>
                    {quizOptions.map((gestureName) => {
                      const gestureData = GESTURES.find((g) => g.name === gestureName);
                      return (
                        <motion.div
                          key={gestureName}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`p-4 cursor-pointer transition-all hover:bg-blue-50 ${disabled ? "opacity-75" : ""} border-2 hover:border-blue-400`}
                            onClick={() => handleGestureSelect(gestureName)}
                          >
                            <div className="text-center">
                              <div
                                className="text-4xl mb-2"
                                style={{ color: gestureData?.color || "black" }}
                              >
                                {gestureData?.emoji}
                              </div>
                              <div className="text-xl font-bold text-blue-900">{gestureName}</div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Feedback message */}
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 rounded-lg ${feedback.correct ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                    >
                      <div className="flex items-center">
                        {feedback.correct ? <FaSmile className="text-green-500 text-2xl mr-2" /> : <FaSadTear className="text-orange-500 text-2xl mr-2" />}
                        <p>{feedback.message}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Celebration overlay */}
                  {showCelebration && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="text-4xl text-center text-yellow-500 font-bold bg-white bg-opacity-70 p-6 rounded-xl shadow-lg">
                        <div>Amazing Streak: {streak}!</div>
                        <div className="text-2xl mt-2">Keep going!</div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>
          </>
        )}

        {/* Audio element for sound effects */}
        <audio ref={audioRef} />

        {/* Voice feedback for accessibility */}
        <VoiceFeedback message={feedback?.message || ""} play={!!feedback} text={feedback?.message || ""} rate={1} />
      </div>
    </GameLayout>
  );
}