import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { saveGameData } from "@/lib/firestore-utils"; // Import Firestore utility

// Speech Synthesis
const speak = (text: string) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  }
};

const LEARNING_THEMES = [
  { id: 1, emoji: "🐻", name: "Bears", color: "bg-red-300" },
  { id: 2, emoji: "🚗", name: "Cars", color: "bg-orange-300" },
  { id: 3, emoji: "🌟", name: "Stars", color: "bg-blue-300" },
];

type GameMode = "counting" | "practice" | "quiz";
type Operation = "add" | "subtract";
type Difficulty = "easy" | "medium" | "hard";

const MathWorld = () => {
  const [mode, setMode] = useState<GameMode>("counting");
  const [theme, setTheme] = useState(0);
  const [rewards, setRewards] = useState<string[]>([]);

  // Counting Mode State
  const [count, setCount] = useState(0);
  const [bounce, setBounce] = useState(false);

  // Practice Mode State
  const [firstNum, setFirstNum] = useState(2);
  const [secondNum, setSecondNum] = useState(1);
  const [currentOperation, setCurrentOperation] = useState<Operation>("add");

  // Quiz Mode State
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [quizScore, setQuizScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // Updated timer
  const [quizActive, setQuizActive] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({
    num1: 2,
    num2: 1,
    operation: "+",
    answer: 3,
    options: [3, 1, 4, 2],
  });

  // Counting Mode Component (unchanged)
  const CountingMode = () => {
    const handleAdd = () => {
      const newCount = count + 1;
      setCount(newCount);
      speak(`${newCount} ${LEARNING_THEMES[theme].name.toLowerCase()}`);

      if (newCount % 5 === 0) {
        setRewards([...rewards, "🎖️"]);
        confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
      }
      setBounce(true);
      setTimeout(() => setBounce(false), 200);
    };

    return (
      <div className={`p-6 rounded-2xl transition-colors duration-500 ${LEARNING_THEMES[theme].color}`}>
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-md">
            Let's Count {LEARNING_THEMES[theme].emoji}
          </h2>

          <motion.div className="flex flex-wrap gap-4 justify-center mb-8" layout>
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                className="text-6xl cursor-pointer"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                whileHover={{ scale: 1.1 }}
                animate={bounce ? { y: [-10, 0] } : {}}
              >
                {LEARNING_THEMES[theme].emoji}
              </motion.div>
            ))}
          </motion.div>

          <div className="text-8xl mb-6 text-white font-bold drop-shadow-md">{count}</div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Button
              className="py-8 text-2xl shadow-lg bg-white/20 hover:bg-white/30 text-white"
              onClick={handleAdd}
            >
              Add {LEARNING_THEMES[theme].emoji}
            </Button>
            <Button
              className="py-8 text-2xl shadow-lg bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setCount(0)}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Practice Mode Component (unchanged)
  const PracticeMode = () => {
    const result = currentOperation === "add" ? firstNum + secondNum : Math.max(firstNum - secondNum, 0);

    const handleNumberChange = (num: number, isFirst: boolean) => {
      if (isFirst) {
        setFirstNum(Math.max(0, num));
        if (currentOperation === "subtract") {
          setSecondNum((prev) => Math.min(prev, num));
        }
      } else {
        setSecondNum(Math.max(0, num));
      }
    };

    const NumberGroup = ({
      count,
      onChange,
      emoji,
      max = Infinity,
    }: {
      count: number;
      onChange: (num: number) => void;
      emoji: string;
      max?: number;
    }) => (
      <div className="flex flex-col items-center">
        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              className="text-6xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            className="bg-white/20 hover:bg-white/30 text-white"
            onClick={() => onChange(count - 1)}
            disabled={count <= 0}
          >
            -
          </Button>
          <Button
            className="bg-white/20 hover:bg-white/30 text-white"
            onClick={() => onChange(count + 1)}
            disabled={count >= max}
          >
            +
          </Button>
        </div>
      </div>
    );

    return (
      <div className={`p-6 rounded-2xl transition-colors duration-500 ${LEARNING_THEMES[theme].color}`}>
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-md">
            {currentOperation === "add" ? "➕ Let's Add" : "➖ Let's Subtract"}
          </h2>

          <div className="flex justify-center gap-8 mb-8">
            <NumberGroup
              count={firstNum}
              onChange={(n: number) => handleNumberChange(n, true)}
              emoji={LEARNING_THEMES[theme].emoji}
            />

            <div className="text-6xl text-white self-center">
              {currentOperation === "add" ? "+" : "-"}
            </div>

            <NumberGroup
              count={secondNum}
              onChange={(n: number) => handleNumberChange(n, false)}
              emoji={LEARNING_THEMES[theme].emoji}
              max={currentOperation === "subtract" ? firstNum : Infinity}
            />
          </div>

          <div className="text-8xl text-white font-bold mb-8">= {result}</div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Button
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setCurrentOperation("add")}
            >
              Switch to Addition
            </Button>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setCurrentOperation("subtract")}
            >
              Switch to Subtraction
            </Button>
          </div>
        </div>
      </div>
    );
  };
// Quiz Mode Component (updated timer logic)
const QuizMode = () => {
  const generateQuizQuestion = (maxNumber: number) => {
    const operation = Math.random() > 0.5 ? "+" : "-";
    let num1 = Math.floor(Math.random() * maxNumber) + 1;
    let num2 =
      operation === "+"
        ? Math.floor(Math.random() * maxNumber) + 1
        : Math.floor(Math.random() * num1) + 1;

    const answer = operation === "+" ? num1 + num2 : num1 - num2;

    const options = [answer];
    while (options.length < 4) {
      const option = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (option > 0 && !options.includes(option)) options.push(option);
    }

    return {
      num1,
      num2,
      operation,
      answer,
      options: options.sort(() => Math.random() - 0.5),
    };
  };

  // Timer logic (starts at 0 and increments)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizActive && questionsAnswered < totalQuestions) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev + 1); // Increment timer
      }, 1000);
    } else if (questionsAnswered >= totalQuestions) {
      setQuizActive(false);
      saveQuizData(); // Save data when quiz ends
    }
    return () => clearInterval(timer); // Cleanup timer
  }, [quizActive, questionsAnswered, totalQuestions]);

  const startQuiz = (level: Difficulty) => {
    const settings = {
      easy: { questions: 5 },
      medium: { questions: 10 },
      hard: { questions: 15 },
    };

    setDifficulty(level);
    setQuizActive(true);
    setTimeLeft(0); // Reset timer to 0
    setTotalQuestions(settings[level].questions);
    setQuizScore(0);
    setQuestionsAnswered(0);
    setCurrentQuestion(
      generateQuizQuestion(level === "easy" ? 5 : level === "medium" ? 10 : 20)
    );
  };

  const handleQuizAnswer = (selected: number) => {
    if (questionsAnswered >= totalQuestions) return;

    if (selected === currentQuestion.answer) {
      setQuizScore((prev) => prev + 1);
      confetti({ particleCount: 30, spread: 70 });
    }

    setQuestionsAnswered((prev) => prev + 1);

    if (questionsAnswered + 1 < totalQuestions) {
      setCurrentQuestion(
        generateQuizQuestion(
          difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 20
        )
      );
    }
  };

  // Save quiz data to Firestore
  const saveQuizData = async () => {
    const gameResult = {
      Age: parseInt(localStorage.getItem("age") || "0", 10),
      Email: localStorage.getItem("email") || "N/A",
      Game: "Math World",
      Level: difficulty,
      Name: localStorage.getItem("name") || "Guest",
      Score: quizScore,
      TimeTaken: timeLeft, // Store the final timer value
    };

    try {
      await saveGameData(gameResult);
      console.log("Game data saved to Firestore!");
    } catch (error) {
      console.error("Failed to save game data:", error);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white shadow-lg">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-6 text-purple-600">
          🧠 {LEARNING_THEMES[theme].emoji} Quiz -{" "}
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </h2>

        <div className="text-2xl mb-4">
          ⏳ {timeLeft}s | 🏆 {quizScore}/{totalQuestions} | 📝{" "}
          {questionsAnswered}/{totalQuestions}
        </div>

        {questionsAnswered < totalQuestions ? (
          <>
            <div className="text-6xl mb-8">
              {Array(currentQuestion.num1).fill(LEARNING_THEMES[theme].emoji).join(" ")}{" "}
              {currentQuestion.operation}{" "}
              {Array(currentQuestion.num2).fill(LEARNING_THEMES[theme].emoji).join(" ")} = ?
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="w-full py-6 text-2xl bg-purple-800 hover:bg-purple-800"
                    onClick={() => handleQuizAnswer(option)}
                  >
                    {option} {LEARNING_THEMES[theme].emoji}
                  </Button>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-2xl text-green-600 mb-4">
            <div className="text-4xl font-bold mb-4">Quiz Complete! 🎉</div>
            <div>Correct Answers: {quizScore}/{totalQuestions}</div>
            <div>Success Rate: {Math.round((quizScore / totalQuestions) * 100)}%</div>
            <div className="mt-4">
              {Array(Math.floor(quizScore)).fill("⭐").join(" ")}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Button className="bg-green-600 hover:bg-green-600" onClick={() => startQuiz("easy")}>
            Easy 🌱 (5 Qs)
          </Button>
          <Button className="bg-yellow-600 hover:bg-yellow-600" onClick={() => startQuiz("medium")}>
            Medium 🌸 (10 Qs)
          </Button>
          <Button className="bg-red-600 hover:bg-red-600" onClick={() => startQuiz("hard")}>
            Hard 🌟 (15 Qs)
          </Button>
        </div>
      </div>
    </div>
  );
};
  
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-300">
        <div className="container mx-auto p-4 max-w-3xl">
          <h1 className="text-5xl font-bold text-center mb-8 text-purple-600 drop-shadow-md">
            🎮 Play & Learn Math
          </h1>
  
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Button
              className={`text-xl ${mode === "counting" ? "bg-blue-500 text-white" : "bg-gray-600"}`}
              onClick={() => setMode("counting")}
            >
              🧮 Counting
            </Button>
            <Button
              className={`text-xl ${mode === "practice" ? "bg-blue-500 text-white" : "bg-gray-600"}`}
              onClick={() => setMode("practice")}
            >
              ➕➖ Practice
            </Button>
            <Button
              className={`text-xl ${mode === "quiz" ? "bg-blue-500 text-white" : "bg-gray-600"}`}
              onClick={() => setMode("quiz")}
            >
              📝 Quiz
            </Button>
          </div>
  
          {/* Current Mode Display */}
          {mode === "counting" && <CountingMode />}
          {mode === "practice" && <PracticeMode />}
          {mode === "quiz" && <QuizMode />}
  
          {/* Theme Selector */}
          <div className="flex justify-center gap-4 mt-8">
            {LEARNING_THEMES.map((t, index) => (
              <Button
                key={t.id}
                className={`text-2xl p-2 ${theme === index ? "ring-4 ring-purple-700" : "bg-gray-500"}`}
                onClick={() => setTheme(index)}
              >
                {t.emoji}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default MathWorld;