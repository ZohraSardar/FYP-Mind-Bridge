"use client"

import { useState, useEffect, useRef } from "react"
import type { GameMode } from "@shared/schema"
import GameLayout from "@/components/common/GameLayout"
import VoiceFeedback from "@/components/common/VoiceFeedback"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import { FaSmile, FaSadTear, FaClock, FaTrophy, FaVolumeUp, FaRegLightbulb, FaStar } from "react-icons/fa"
import { useSpring, animated } from "@react-spring/web"
import { saveGameData } from "@/lib/firestore-utils" 

interface ShapeGameProps {
  mode: GameMode
  onModeChange: (mode: GameMode) => void
}

const SHAPES = [
  { 
    name: "Circle", 
    shape: "⭕", 
    description: "A round shape with no corners", 
    realWorldExamples: ["clock", "wheel", "plate", "ball"],
    color: "#FF5733"
  },
  { 
    name: "Square", 
    shape: "⬛", 
    description: "A shape with four equal sides and four corners", 
    realWorldExamples: ["TV screen", "window", "block", "toast"],
    color: "#33A1FF"
  },
  { 
    name: "Triangle", 
    shape: "🔺", 
    description: "A shape with three sides and three corners", 
    realWorldExamples: ["pizza slice", "roof", "pyramid", "yield sign"],
    color: "#33FF57"
  },
  { 
    name: "Star", 
    shape: "⭐", 
    description: "A shape with five points", 
    realWorldExamples: ["star in the sky", "sticker", "decoration", "badge"],
    color: "#FFFF33"
  },
  { 
    name: "Heart", 
    shape: "❤️", 
    description: "A shape that represents love", 
    realWorldExamples: ["Valentine's card", "cookie shape", "symbol on clothes", "emoji"],
    color: "#FF33A8"
  },
  { 
    name: "Rectangle", 
    shape: "▭", 
    description: "A shape with opposite sides equal and four corners", 
    realWorldExamples: ["door", "book", "phone", "TV"],
    color: "#A833FF"
  },
  { 
    name: "Oval", 
    shape: "🕳️", 
    description: "A stretched circle shape", 
    realWorldExamples: ["egg", "face", "mirror", "race track"],
    color: "#FF8C33"
  },
  { 
    name: "Diamond", 
    shape: "♦", 
    description: "A four-sided shape with equal sides and different angles", 
    realWorldExamples: ["kite", "playing card", "jewel", "baseball field"],
    color: "#33FFF6"
  }
]

// Simplified to focus on the most common shapes first
const INITIAL_SHAPES = SHAPES.slice(0, 4) // Circle, Square, Triangle, Star

const QUIZ_LEVELS = {
  easy: 5,
  medium: 8,
  hard: 10,
}

const DIFFICULTY_OPTIONS = {
  easy: { shapesCount: 4, optionsCount: 2 }, // Fewer shapes, fewer options
  medium: { shapesCount: 6, optionsCount: 3 },
  hard: { shapesCount: 8, optionsCount: 4 },
}

export default function ShapeGame({ mode, onModeChange }: ShapeGameProps) {
  // Game state
  const [currentShape, setCurrentShape] = useState(() => INITIAL_SHAPES[0])
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [disabled, setDisabled] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [quizLevel, setQuizLevel] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [isDataSaved, setIsDataSaved] = useState(false)
  const [quizOptions, setQuizOptions] = useState<string[]>([])
  const [availableShapes, setAvailableShapes] = useState(INITIAL_SHAPES)
  const [showHint, setShowHint] = useState(false)
  const [showRealWorldExample, setShowRealWorldExample] = useState(false)
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [learningProgress, setLearningProgress] = useState<Record<string, number>>({})
  
  // References
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Animations
  const scoreAnimation = useSpring({ number: score, from: { number: 0 } })
  const timeAnimation = useSpring({ number: timeElapsed, from: { number: 0 } })
  
  // Initialize learning progress tracking
  useEffect(() => {
    const initialProgress: Record<string, number> = {}
    SHAPES.forEach(shape => {
      initialProgress[shape.name] = 0
    })
    setLearningProgress(initialProgress)
  }, [])

  // Setup based on difficulty level
  useEffect(() => {
    const { shapesCount } = DIFFICULTY_OPTIONS[quizLevel]
    setAvailableShapes(SHAPES.slice(0, shapesCount))
  }, [quizLevel])

  // Practice mode - structured learning path
  useEffect(() => {
    if (mode === "practice") {
      // In practice mode, we'll introduce shapes progressively
      // Start with the first shape if it's the beginning
      if (questionCount === 0) {
        setCurrentShape(availableShapes[0])
      }
    }
  }, [mode, questionCount, availableShapes])

  // Generate appropriate quiz options
  const generateQuizOptions = () => {
    const { optionsCount } = DIFFICULTY_OPTIONS[quizLevel]
    const correctAnswer = currentShape.name
    
    // Filter options based on available shapes for current difficulty
    const otherOptions = availableShapes
      .filter((shape) => shape.name !== correctAnswer)
      .map((shape) => shape.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, optionsCount - 1) // Get appropriate number of incorrect options
    
    setQuizOptions([correctAnswer, ...otherOptions].sort(() => 0.5 - Math.random()))
  }

  // Start timer for quiz mode
  useEffect(() => {
    if (mode === "quiz" && !gameOver && !timerInterval) {
      const interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)
      setTimerInterval(interval)
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [mode, gameOver, timerInterval])

  // Stop timer when game ends
  useEffect(() => {
    if (gameOver && timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }, [gameOver, timerInterval])

  // Generate quiz options when shape changes
  useEffect(() => {
    if (mode === "quiz") {
      generateQuizOptions()
    }
  }, [currentShape, mode, quizLevel])

  // Check if quiz is completed and save data
  useEffect(() => {
    if (mode === "quiz" && questionCount >= QUIZ_LEVELS[quizLevel] && !isDataSaved) {
      setGameOver(true)
      setIsDataSaved(true)

      // Prepare game result
      const gameResult = {
        Age: parseInt(localStorage.getItem("age") || "0", 10),
        Email: localStorage.getItem("email") || "N/A",
        Game: "Shape Recognition",
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
  }, [questionCount, mode, quizLevel, score, timeElapsed, isDataSaved])

  // Celebration effects
  useEffect(() => {
    if (showCelebration) {
      triggerConfetti()
      setTimeout(() => {
        setShowCelebration(false)
      }, 3000)
    }
  }, [showCelebration])

  // Trigger confetti for correct answers
  function triggerConfetti() {
    confetti({ 
      particleCount: 100, 
      spread: 70, 
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF4500']
    })
  }

  // Play sound effect
  const playSound = (isCorrect: boolean) => {
    if (audioRef.current) {
      audioRef.current.src = isCorrect 
        ? "/sounds/correct.mp3" 
        : "/sounds/incorrect.mp3"
      audioRef.current.play().catch(e => console.log("Audio play failed:", e))
    }
  }

  // Handle shape selection
  const handleShapeSelect = (selectedShape: string) => {
    if (disabled || gameOver) return

    const isCorrect = selectedShape === currentShape.name
    
    // Update learning progress for this shape
    if (isCorrect) {
      setLearningProgress(prev => ({
        ...prev,
        [currentShape.name]: Math.min((prev[currentShape.name] || 0) + 1, 5) // Cap at 5 for mastery
      }))
      
      setConsecutiveCorrect(prev => prev + 1)
      setStreak(prev => prev + 1)
      
      // Celebrate streaks
      if (streak > 0 && streak % 3 === 0) {
        setShowCelebration(true)
      }
    } else {
      setConsecutiveCorrect(0)
      setStreak(0)
    }

    // Prepare feedback message
    let feedbackMessage = isCorrect
      ? `Great job! This is a ${currentShape.name}! ${currentShape.description}`
      : `Let's try again! This is a ${currentShape.name}. ${currentShape.description}`
    
    // Add a real-world example to help with learning transfer
    if (mode === "practice") {
      const example = currentShape.realWorldExamples[0]
      feedbackMessage += isCorrect 
        ? ` You can find ${currentShape.name}s in everyday objects like a ${example}!` 
        : ` Look for ${currentShape.name}s in everyday objects like a ${example}.`
    }
    
    setFeedback({
      correct: isCorrect,
      message: feedbackMessage,
    })

    // Visual and audio feedback
    if (isCorrect) {
      if (mode === "quiz") triggerConfetti()
      playSound(true)
      setScore((prevScore) => prevScore + 1)
      setCorrectAnswers(prev => prev + 1)
    } else {
      playSound(false)
    }

    setDisabled(true)
    
    // Always increment question count in both modes to ensure progression
    setQuestionCount((prevCount) => prevCount + 1)

    // Progress to next question after delay
    setTimeout(() => {
      setFeedback(null)
      setShowHint(false)
      setShowRealWorldExample(false)
      
      if (!gameOver) {
        // In practice mode, determine next shape based on progress
        if (mode === "practice") {
          const currentProgress = learningProgress[currentShape.name] || 0
          
          // Always move to next shape regardless of mastery status
          const currentIndex = availableShapes.findIndex(s => s.name === currentShape.name)
          const nextIndex = (currentIndex + 1) % availableShapes.length
          setCurrentShape(availableShapes[nextIndex])
        } else {
          // In quiz mode, always show a new random shape
          let newShape
          do {
            newShape = availableShapes[Math.floor(Math.random() * availableShapes.length)]
          } while (newShape.name === currentShape.name)
          setCurrentShape(newShape)
        }
        
        setDisabled(false)
      }
    }, 3000) // Slightly longer for processing feedback
  }

  // Show hint
  const handleShowHint = () => {
    setShowHint(true)
  }

  // Show real-world examples
  const handleShowExample = () => {
    setShowRealWorldExample(true)
    setCurrentExampleIndex(0)
  }

  // Cycle through examples
  const nextExample = () => {
    setCurrentExampleIndex(prev => (prev + 1) % currentShape.realWorldExamples.length)
  }

  // Reset the game
  const resetGame = () => {
    setQuestionCount(0)
    setScore(0)
    setCorrectAnswers(0)
    setConsecutiveCorrect(0)
    setGameOver(false)
    setTimeElapsed(0)
    setIsDataSaved(false)
    setStreak(0)
    
    // Start with the first shape for practice mode
    if (mode === "practice") {
      setCurrentShape(availableShapes[0])
    } else {
      setCurrentShape(availableShapes[Math.floor(Math.random() * availableShapes.length)])
    }
    
    if (mode === "quiz") generateQuizOptions()
  }

  // Calculate progress indication
  const getProgressIndicator = () => {
    if (mode === "practice") {
      return (
        <div className="flex justify-center items-center gap-1 mb-4">
          {availableShapes.map((shape, index) => {
            const isCurrent = shape.name === currentShape.name
            const mastery = learningProgress[shape.name] || 0
            
            return (
              <div 
                key={shape.name} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                  ${isCurrent ? 'border-4 border-blue-500' : 'border border-gray-300'}
                  ${mastery >= 3 ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                title={`${shape.name}: ${mastery}/3 mastered`}
              >
                {mastery >= 3 ? '✓' : (index + 1)}
              </div>
            )
          })}
        </div>
      )
    } else {
      return (
        <div className="text-center mb-4">
          <span className="font-bold">{questionCount}</span> of <span className="font-bold">{QUIZ_LEVELS[quizLevel]}</span> questions
        </div>
      )
    }
  }

  return (
    <GameLayout title="Shape Recognition" mode={mode} onModeChange={onModeChange}>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Practice and Quiz Mode Buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <Button
            variant={mode === "practice" ? "default" : "outline"}
            onClick={() => {
              onModeChange("practice")
              resetGame()
            }}
            className={`text-white ${mode === "practice" ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 hover:bg-gray-500"}`}
          >
            <FaRegLightbulb className="mr-2" /> Learning Mode
          </Button>
          <Button
            variant={mode === "quiz" ? "default" : "outline"}
            onClick={() => {
              onModeChange("quiz")
              resetGame()
            }}
            className={`text-white ${mode === "quiz" ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-400 hover:bg-gray-500"}`}
          >
            <FaTrophy className="mr-2" /> Quiz Mode
          </Button>
        </div>

        {/* Mode-specific controls */}
        {mode === "quiz" && (
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
                    setQuizLevel(lvl)
                    resetGame()
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
        )}

        {/* Practice mode specific controls */}
        {mode === "practice" && (
          <div className="bg-blue-100 rounded-lg p-4 mb-4 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500" />
                <span className="font-bold">{correctAnswers}</span> correct
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1">
                  <FaSmile className="text-green-500" />
                  <span className="font-bold">{streak}</span> streak
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleShowHint}
                disabled={showHint}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                size="sm"
              >
                <FaRegLightbulb className="mr-1" /> Hint
              </Button>
              <Button 
                onClick={handleShowExample}
                disabled={showRealWorldExample}
                className="bg-teal-500 hover:bg-teal-600 text-white"
                size="sm"
              >
                <FaVolumeUp className="mr-1" /> Examples
              </Button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        {getProgressIndicator()}

        {/* Main game area */}
        {!gameOver ? (
          <Card className="p-6 bg-white shadow-lg rounded-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentShape.name + questionCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                {/* Shape display */}
                <div 
                  className="text-8xl mb-4 p-6 mx-auto"
                  style={{ color: currentShape.color }}
                >
                  {currentShape.shape}
                </div>
                <div className="text-2xl mb-6 text-blue-900 font-bold">
                  What shape is this?
                </div>
                
                {/* Hint area - only in practice mode */}
                {mode === "practice" && showHint && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-yellow-100 rounded-lg text-yellow-800"
                  >
                    <p><strong>Hint:</strong> {currentShape.description}</p>
                  </motion.div>
                )}
                
                {/* Examples area - only in practice mode */}
                {mode === "practice" && showRealWorldExample && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-teal-100 rounded-lg text-teal-800 flex flex-col items-center"
                  >
                    <p>You can find a {currentShape.name.toLowerCase()} in a <strong>{currentShape.realWorldExamples[currentExampleIndex]}</strong></p>
                    {currentShape.realWorldExamples.length > 1 && (
                      <Button 
                        onClick={nextExample} 
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Show another example
                      </Button>
                    )}
                  </motion.div>
                )}
                
                {/* Options grid - select shapes */}
                <div className={`grid ${mode === "practice" ? "grid-cols-2" : `grid-cols-${DIFFICULTY_OPTIONS[quizLevel].optionsCount > 2 ? "2" : "2"}`} gap-4`}>
                  {(mode === "quiz" ? quizOptions : availableShapes.slice(0, 4).map(shape => shape.name)).map((shapeName) => {
                    const shapeData = SHAPES.find(s => s.name === shapeName)
                    return (
                      <motion.div
                        key={shapeName}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`p-4 cursor-pointer transition-all hover:bg-blue-50 ${disabled ? "opacity-75" : ""} border-2 hover:border-blue-400`}
                          onClick={() => handleShapeSelect(shapeName)}
                        >
                          <div className="text-center">
                            <div 
                              className="text-4xl mb-2"
                              style={{ color: shapeData?.color || "black" }}
                            >
                              {shapeData?.shape}
                            </div>
                            <div className="text-xl font-bold text-blue-900">{shapeName}</div>
                          </div>
                        </Card>
                      </motion.div>
                    )
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
        ) : (
          <Card className="p-8 bg-white shadow-lg text-center rounded-xl">
            <h2 className="text-3xl font-bold mb-4 text-purple-900">Quiz Complete!</h2>
            <p className="text-xl mb-2 text-blue-600">Your score: {score} / {QUIZ_LEVELS[quizLevel]}</p>
            <p className="text-xl mb-4 text-blue-600">Time taken: {timeElapsed} seconds</p>
            
            {/* Feedback based on score */}
            <div className="mb-6 p-4 bg-blue-100 rounded-lg">
              {score / QUIZ_LEVELS[quizLevel] >= 0.8 ? (
                <p className="text-green-600 font-bold">Outstanding! You're a shape master!</p>
              ) : score / QUIZ_LEVELS[quizLevel] >= 0.6 ? (
                <p className="text-blue-600">Great work! Keep practicing to improve even more.</p>
              ) : (
                <p className="text-orange-600">Good try! Let's practice some more to learn the shapes better.</p>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={resetGame} className="bg-green-500 hover:bg-green-600 text-white">
                Play Again
              </Button>
              <Button 
                onClick={() => { onModeChange("practice"); resetGame(); }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Switch to Learning Mode
              </Button>
            </div>
          </Card>
        )}

        {/* Audio element for sound effects */}
        <audio ref={audioRef} />
        
        {/* Voice feedback for accessibility */}
        <VoiceFeedback message={feedback?.message || ""} play={!!feedback} text={feedback?.message || ""} rate={1} />
      </div>
    </GameLayout>
  )
}