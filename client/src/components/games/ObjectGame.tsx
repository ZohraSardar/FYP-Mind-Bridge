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

interface ObjectGameProps {
  mode: GameMode
  onModeChange: (mode: GameMode) => void
}

const OBJECTS = [
  { 
    name: "Knife", 
    category: "harmful", 
    emoji: "🔪", 
    description: "A sharp tool used for cutting", 
    safetyTips: ["Never run with knives", "Keep away from small children", "Always cut away from your body"],
    color: "#FF5733"
  },
  { 
    name: "Ball", 
    category: "non-harmful", 
    emoji: "⚽", 
    description: "A round object used for playing games", 
    safetyTips: ["Safe to play with", "Can be shared with friends", "Good for exercise"],
    color: "#33A1FF"
  },
  { 
    name: "Fire", 
    category: "harmful", 
    emoji: "🔥", 
    description: "Heat and flames that can burn", 
    safetyTips: ["Never play with matches", "Stay away from open flames", "Tell an adult if you see fire"],
    color: "#FF8C33"
  },
  { 
    name: "Book", 
    category: "non-harmful", 
    emoji: "📚", 
    description: "Pages with words and stories", 
    safetyTips: ["Safe to read", "Good for learning", "Can be shared with others"],
    color: "#A833FF"
  },
  { 
    name: "Scissors", 
    category: "harmful", 
    emoji: "✂️", 
    description: "Tool with sharp blades for cutting", 
    safetyTips: ["Use with adult supervision", "Always cut away from yourself", "Walk carefully when holding scissors"],
    color: "#FF33A8"
  },
  { 
    name: "Teddy Bear", 
    category: "non-harmful", 
    emoji: "🧸", 
    description: "A soft toy for hugging and playing", 
    safetyTips: ["Safe to play with", "Good for comfort", "Can be kept in your room"],
    color: "#33FF57"
  },
  { 
    name: "Gun", 
    category: "harmful", 
    emoji: "🔫", 
    description: "A dangerous weapon", 
    safetyTips: ["Never touch real guns", "Tell an adult if you see one", "Stay away from any weapon"],
    color: "#808080"
  },
  { 
    name: "Pencil", 
    category: "non-harmful", 
    emoji: "✏️", 
    description: "A tool for writing and drawing", 
    safetyTips: ["Safe to use for writing", "Don't poke others", "Be careful with sharp points"],
    color: "#FFFF33"
  },
  { 
    name: "Broken Glass", 
    category: "harmful", 
    emoji: "🩹", 
    description: "Sharp pieces that can cut you", 
    safetyTips: ["Never touch broken glass", "Tell an adult if you see some", "Stay away from it"],
    color: "#33FFF6"
  },
  { 
    name: "Apple", 
    category: "non-harmful", 
    emoji: "🍏", 
    description: "A healthy fruit for eating", 
    safetyTips: ["Good for your health", "Wash before eating", "Safe to share with others"],
    color: "#33FF57"
  },
  { 
    name: "Needle", 
    category: "harmful", 
    emoji: "🪡", 
    description: "A sharp tool for sewing", 
    safetyTips: ["Only use with adult supervision", "Keep in a safe container", "Be very careful with the sharp point"],
    color: "#696969"
  },
  { 
    name: "Balloon", 
    category: "non-harmful", 
    emoji: "🎈", 
    description: "A colorful inflatable toy", 
    safetyTips: ["Fun to play with", "Don't put in your mouth", "Keep away from very small children"],
    color: "#FF33A8"
  }
]

// Initial objects for the game
const INITIAL_OBJECTS = OBJECTS.slice(0, 6) // First 6 objects

const QUIZ_LEVELS = {
  easy: 5,
  medium: 8,
  hard: 10,
}

const DIFFICULTY_OPTIONS = {
  easy: { objectsCount: 6, optionsCount: 2 }, // Fewer objects
  medium: { objectsCount: 9, optionsCount: 2 },
  hard: { objectsCount: 12, optionsCount: 2 },
}

export default function ObjectIdentificationGame({ mode, onModeChange = () => {} }: ObjectGameProps) {
  // Game state
  const [currentObject, setCurrentObject] = useState(() => INITIAL_OBJECTS[0])
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
  const [availableObjects, setAvailableObjects] = useState(INITIAL_OBJECTS)
  const [showHint, setShowHint] = useState(false)
  const [showSafetyTips, setShowSafetyTips] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [learningProgress, setLearningProgress] = useState<Record<string, number>>({})
  const [internalMode, setInternalMode] = useState<GameMode>(mode)
  
  // References
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Animations
  const scoreAnimation = useSpring({ number: score, from: { number: 0 } })
  const timeAnimation = useSpring({ number: timeElapsed, from: { number: 0 } })
  
  // Initialize learning progress tracking
  useEffect(() => {
    const initialProgress: Record<string, number> = {}
    OBJECTS.forEach(object => {
      initialProgress[object.name] = 0
    })
    setLearningProgress(initialProgress)
  }, [])

  // Setup based on difficulty level
  useEffect(() => {
    const { objectsCount } = DIFFICULTY_OPTIONS[quizLevel]
    setAvailableObjects(OBJECTS.slice(0, objectsCount))
  }, [quizLevel])

  // Practice mode - structured learning path
  useEffect(() => {
    if (internalMode === "practice") {
      // In practice mode, we'll introduce objects progressively
      // Start with the first object if it's the beginning
      if (questionCount === 0) {
        setCurrentObject(availableObjects[0])
      }
    }
  }, [internalMode, questionCount, availableObjects])

  // Start timer for quiz mode
  useEffect(() => {
    if (internalMode === "quiz" && !gameOver && !timerInterval) {
      const interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)
      setTimerInterval(interval)
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [internalMode, gameOver, timerInterval])

  // Stop timer when game ends
  useEffect(() => {
    if (gameOver && timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }, [gameOver, timerInterval])

  // Check if quiz is completed and save data
  useEffect(() => {
    if (internalMode === "quiz" && questionCount >= QUIZ_LEVELS[quizLevel] && !isDataSaved) {
      setGameOver(true)
      setIsDataSaved(true)

      // Prepare game result
      const gameResult = {
        Age: parseInt(localStorage.getItem("age") || "0", 10),
        Email: localStorage.getItem("email") || "N/A",
        Game: "Object Identification",
        Level: quizLevel,
        Name: localStorage.getItem("name") || "Guest",
        Score: score,
        TimeTaken: timeElapsed,
      }

      // Save game data to Firestore
      saveGameData(gameResult)
        .then(() => {
          console.log("Game data saved to Firestore!")
        })
        .catch((error) => {
          console.error("Failed to save game data:", error)
        })
    }
  }, [questionCount, internalMode, quizLevel, score, timeElapsed, isDataSaved])

  // Celebration effects
  useEffect(() => {
    if (showCelebration) {
      triggerConfetti()
      setTimeout(() => {
        setShowCelebration(false)
      }, 3000)
    }
  }, [showCelebration])

  // Handle mode change safely
  const handleModeChange = (newMode: GameMode) => {
    setInternalMode(newMode)
    if (typeof onModeChange === 'function') {
      try {
        onModeChange(newMode)
      } catch (error) {
        console.error("Error in onModeChange:", error)
      }
    }
  }

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

  // Handle category selection
  const handleCategorySelect = (selectedCategory: string) => {
    if (disabled || gameOver) return

    const isCorrect = selectedCategory === currentObject.category
    
    // Update learning progress for this object
    if (isCorrect) {
      setLearningProgress(prev => ({
        ...prev,
        [currentObject.name]: Math.min((prev[currentObject.name] || 0) + 1, 5) // Cap at 5 for mastery
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
      ? `Great job! ${currentObject.name} is ${selectedCategory}! ${currentObject.description}`
      : `Let's try again! ${currentObject.name} is actually ${currentObject.category}. ${currentObject.description}`
    
    // Add a safety tip to help with learning
    if (internalMode === "practice") {
      const tip = currentObject.safetyTips[0]
      feedbackMessage += isCorrect 
        ? ` Remember: ${tip}!` 
        : ` Safety tip: ${tip}.`
    }
    
    setFeedback({
      correct: isCorrect,
      message: feedbackMessage,
    })

    // Visual and audio feedback
    if (isCorrect) {
      if (internalMode === "quiz") triggerConfetti()
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
      setShowSafetyTips(false)
      
      if (!gameOver) {
        // In practice mode, determine next object based on progress
        if (internalMode === "practice") {
          const currentProgress = learningProgress[currentObject.name] || 0
          
          // Always move to next object if this isn't mastered
          const currentIndex = availableObjects.findIndex(o => o.name === currentObject.name)
          const nextIndex = (currentIndex + 1) % availableObjects.length
          setCurrentObject(availableObjects[nextIndex])
        } else {
          // In quiz mode, always show a new random object
          let newObject
          do {
            newObject = availableObjects[Math.floor(Math.random() * availableObjects.length)]
          } while (newObject.name === currentObject.name)
          setCurrentObject(newObject)
        }
        
        setDisabled(false)
      }
    }, 3000) // Slightly longer for processing feedback
  }

  // Show hint
  const handleShowHint = () => {
    setShowHint(true)
  }

  // Show safety tips
  const handleShowSafetyTips = () => {
    setShowSafetyTips(true)
    setCurrentTipIndex(0)
  }

  // Cycle through safety tips
  const nextTip = () => {
    setCurrentTipIndex(prev => (prev + 1) % currentObject.safetyTips.length)
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
  
  // Start with the first object for practice mode
  if (internalMode === "practice") {
    setCurrentObject(availableObjects[0])
  } else {
    setCurrentObject(availableObjects[Math.floor(Math.random() * availableObjects.length)])
  }
}

// Calculate progress indication
const getProgressIndicator = () => {
  if (internalMode === "practice") {
    return (
      <div className="flex justify-center items-center gap-1 mb-4">
        {availableObjects.map((object, index) => {
          const isCurrent = object.name === currentObject.name
          const mastery = learningProgress[object.name] || 0
          
          return (
            <div 
              key={object.name} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                ${isCurrent ? 'border-4 border-blue-500' : 'border border-gray-300'}
                ${mastery >= 3 ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
              title={`${object.name}: ${mastery}/3 mastered`}
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
  <GameLayout title="Object Identification" mode={internalMode} onModeChange={handleModeChange}>
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Practice and Quiz Mode Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <Button
          variant={internalMode === "practice" ? "default" : "outline"}
          onClick={() => {
            handleModeChange("practice")
            resetGame()
          }}
          className={`text-white ${internalMode === "practice" ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 hover:bg-gray-500"}`}
        >
          <FaRegLightbulb className="mr-2" /> Learning Mode
        </Button>
        <Button
          variant={internalMode === "quiz" ? "default" : "outline"}
          onClick={() => {
            handleModeChange("quiz")
            resetGame()
          }}
          className={`text-white ${internalMode === "quiz" ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-400 hover:bg-gray-500"}`}
        >
          <FaTrophy className="mr-2" /> Quiz Mode
        </Button>
      </div>

      {/* Mode-specific controls */}
      {internalMode === "quiz" && (
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
      {internalMode === "practice" && (
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
              onClick={handleShowSafetyTips}
              disabled={showSafetyTips}
              className="bg-teal-500 hover:bg-teal-600 text-white"
              size="sm"
            >
              <FaVolumeUp className="mr-1" /> Safety Tips
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
              key={currentObject.name + questionCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Object display */}
              <div 
                className="text-8xl mb-4 p-6 mx-auto"
                style={{ color: currentObject.color }}
              >
                {currentObject.emoji}
              </div>
              <div className="text-2xl mb-6 text-blue-900 font-bold">
                Is this {currentObject.name} harmful or safe?
              </div>
              
              {/* Hint area - only in practice mode */}
              {internalMode === "practice" && showHint && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-yellow-100 rounded-lg text-yellow-800"
                >
                  <p><strong>Hint:</strong> {currentObject.description}</p>
                </motion.div>
              )}
              
              {/* Safety Tips area - only in practice mode */}
              {internalMode === "practice" && showSafetyTips && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-teal-100 rounded-lg text-teal-800 flex flex-col items-center"
                >
                  <p><strong>Safety Tip:</strong> {currentObject.safetyTips[currentTipIndex]}</p>
                  {currentObject.safetyTips.length > 1 && (
                    <Button 
                      onClick={nextTip} 
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Show another tip
                    </Button>
                  )}
                </motion.div>
              )}
              
              {/* Category options */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="p-4 cursor-pointer transition-all hover:bg-red-50 border-2 hover:border-red-400"
                    onClick={() => handleCategorySelect("harmful")}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">⚠️</div>
                      <div className="text-xl font-bold text-red-600">Harmful</div>
                    </div>
                  </Card>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="p-4 cursor-pointer transition-all hover:bg-green-50 border-2 hover:border-green-400"
                    onClick={() => handleCategorySelect("non-harmful")}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">✅</div>
                      <div className="text-xl font-bold text-green-600">Safe</div>
                    </div>
                  </Card>
                </motion.div>
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
              <p className="text-green-600 font-bold">Outstanding! You're a safety expert!</p>
            ) : score / QUIZ_LEVELS[quizLevel] >= 0.6 ? (
              <p className="text-blue-600">Great work! Keep practicing to improve your safety knowledge.</p>
            ) : (
              <p className="text-orange-600">Good try! Let's practice some more to learn about harmful and safe objects.</p>
            )}
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={resetGame} className="bg-green-500 hover:bg-green-600 text-white">
              Play Again
            </Button>
            <Button 
              onClick={() => { handleModeChange("practice"); resetGame(); }}
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