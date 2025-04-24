import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import GameCard from "@/components/common/GameCard";
import { Link } from "wouter";
import { LogOut, Rocket, Smile, BrainCircuit, HeartHandshake, Stars, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import afshanImage from './Afshan Naeem.jpeg';
import zohraImage from './Zohra Sardar.jpg';
import saadImage from './Saad Amin.jpg';
// import { SparklesCore } from "@/components/ui/sparkles";

const AUTISM_FACTS = [
  {
    title: "Unique Perspectives",
    description: "Individuals with autism often have exceptional abilities in visual skills, music, and problem-solving",
    icon: <BrainCircuit className="h-12 w-12 text-blue-600" />,
    color: "bg-blue-100 hover:bg-blue-200"
  },
  {
    title: "Early Intervention",
    description: "Early support can significantly improve a child's development",
    icon: <Rocket className="h-12 w-12 text-purple-600" />,
    color: "bg-purple-100 hover:bg-purple-200"
  },
  {
    title: "Learning Styles",
    description: "Personalized education approaches are essential",
    icon: <Smile className="h-12 w-12 text-green-600" />,
    color: "bg-green-100 hover:bg-green-200"
  }
];

const TEAM_MEMBERS = [
  {
    name: "Saad Amin",
    role: " Game Developer & Backend Engineer",
    description:"Saad Amin has played a key role in developing the interactive game modules that make learning engaging for autistic children. He also manages the backend infrastructure, ensuring smooth data handling, user progress tracking, and overall platform stability.",
    avatar: "👨‍💻",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    image: saadImage // Add the image path here
  },
  {
    name: "Afshan Naeem",
    role: " AI & Report Generation Expert",
    description: "Afshan Naeem has developed and trained the AI model that powers the platform’s personalized learning reports. Her work enables real-time analysis of user interactions, helping caregivers and educators track progress and tailor support strategies effectively..",
    avatar: "👩‍🏫",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    image: afshanImage // Add the image path here
  },
  {
    name: "Zohra Sardar",
    role: "Frontend Developer & Integration Specialist",
    description: "Zohra Sardar has crafted an intuitive and visually appealing interface, making the platform accessible and user-friendly. She has also ensured seamless integration between the frontend, backend, and AI-powered features, optimizing user experience.",
    avatar: "👩‍🎨",
    bgColor: "bg-pink-50 hover:bg-pink-100",
    image: zohraImage // Add the image path here
  }
];

const GAMES = [
  { 
    title: "Mathematics", 
    icon: "🎲", 
    href: "/game/math",
    color: "bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300"
  },
  { 
    title: "Object ID", 
    icon: "🖼", 
    href: "/game/objects",
    color: "bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300"
  },
  { 
    title: "Gesture Recognition",
    icon: "🤸‍♂️",  
    href: "/game/speech",
    color: "bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300"
  },
  { 
    title: "Colors & Shapes", 
    icon: "🎨", 
    href: "/game/colorshape",
    color: "bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Floating animation for background elements
const floatingAnimation = {
  initial: { y: 0 },
  animate: { 
    y: [0, -10, 0, 10, 0]
  }
};

const FloatingElement = ({ children, delay = 0, scale = 1, className = "" }: { children: React.ReactNode; delay?: number; scale?: number; className?: string }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={floatingAnimation}
    transition={{ delay }}
    style={{ scale }}
    className={`absolute z-0 opacity-30 ${className}`}
  >
    {children}
  </motion.div>
);

// Rainbow text effect component
const RainbowText = ({ text, className = "", fontSize = "text-5xl" }: { text: string; className?: string; fontSize?: string }) => {
  const colors = ["text-red-500", "text-orange-500", "text-yellow-500", "text-green-500", "text-blue-500", "text-indigo-500", "text-violet-500"];
  
  return (
    <div className={`${fontSize} font-bold ${className}`}>
      {text.split('').map((char: string, index) => (
        <span key={index} className={char === " " ? "mr-2" : colors[index % colors.length]}>
          {char}
        </span>
      ))}
    </div>
  );
};

// Custom cursor for interactive elements
const CustomCursor = ({ emoji }: { emoji: string }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  return (
    <motion.div
      className="fixed text-4xl pointer-events-none z-50"
      animate={{ x: position.x + 10, y: position.y + 10, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.1 }}
    >
      {emoji}
    </motion.div>
  );
};

export default function HomePage() {
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const [cursorEmoji, setCursorEmoji] = useState("✨");
  const [showCursor, setShowCursor] = useState(false);

  // Animated background bubbles
  const backgroundElements = [
    { emoji: "🌟", position: "top-20 left-20", scale: 1.5, delay: 0 },
    { emoji: "🔵", position: "top-40 right-40", scale: 1.2, delay: 1 },
    { emoji: "🧩", position: "bottom-20 left-40", scale: 1.8, delay: 2 },
    { emoji: "🌈", position: "bottom-40 right-20", scale: 1.3, delay: 1.5 },
    { emoji: "💫", position: "top-1/2 left-1/4", scale: 1.4, delay: 0.5 },
    { emoji: "🎯", position: "bottom-1/3 right-1/3", scale: 1.6, delay: 2.5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {showCursor && <CustomCursor emoji={cursorEmoji} />}

      {/* Animated background elements */}
      {backgroundElements.map((el, idx) => (
        <FloatingElement 
          key={idx} 
          delay={el.delay} 
          scale={el.scale} 
          className={el.position}
        >
          <span className="text-5xl">{el.emoji}</span>
        </FloatingElement>
      ))}

      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-200">
        <motion.div 
          className="container mx-auto px-4 h-20 flex items-center justify-between"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            className="flex items-center gap-2"
            onMouseEnter={() => {setCursorEmoji("🧠"); setShowCursor(true);}}
            onMouseLeave={() => setShowCursor(false)}
          >
            <div className="relative">
              <HeartHandshake className="h-10 w-10 text-blue-600 z-10 relative" />
              <motion.div 
                className="absolute inset-0 bg-yellow-200 rounded-full z-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mind Bridge
              </h1>
              <p className="text-xs text-blue-500">Connecting abilities, unlocking potential</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout()}
              className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full h-12 w-12"
              onMouseEnter={() => {setCursorEmoji("👋"); setShowCursor(true);}}
              onMouseLeave={() => setShowCursor(false)}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-12 space-y-24 relative z-10">
        {/* Hero Section */}
        <section className="relative">
          <motion.div 
            className="absolute -top-10 -left-10 text-8xl"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          >
            🧩
          </motion.div>
          
          <motion.div 
            className="absolute -bottom-20 -right-10 text-8xl"
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 15, repeat: Infinity }}
          >
            🌈
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="relative max-w-4xl mx-auto text-center"
          >
            <motion.div 
              variants={item} 
              className="mb-6"
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => {setCursorEmoji("💫"); setShowCursor(true);}}
              onMouseLeave={() => setShowCursor(false)}
            >
              <RainbowText text="Welcome to Mind Bridge!" className="mb-2" />
              <h2 className="text-4xl font-bold text-blue-900">
                Empowering Neurodiverse Learners
              </h2>
            </motion.div>
            
            <motion.div
              variants={item}
              whileHover={{ scale: 1.02 }}
              className="relative p-6 bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl mb-12"
            >
              <p className="text-xl text-blue-700 leading-relaxed">
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mind Bridge</span> is a dedicated platform for autistic children, creating a safe space where learning becomes a joyful adventure. We celebrate unique abilities and foster growth through engaging, sensory-friendly activities designed with love and expertise.
              </p>
              <motion.div 
                className="absolute -right-3 -bottom-3 text-4xl"
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </motion.div>

            <motion.div
              variants={container}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {AUTISM_FACTS.map((fact) => (
                <motion.div 
                  key={fact.title} 
                  variants={item}
                  onMouseEnter={() => {setCursorEmoji("🌟"); setShowCursor(true);}}
                  onMouseLeave={() => setShowCursor(false)}
                >
                  <Card className={`${fact.color} border-0 hover:shadow-xl transition-all h-full transform hover:-translate-y-2 duration-300 rounded-2xl overflow-hidden`}>
                    <CardHeader>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="inline-block mb-4 bg-white/50 p-4 rounded-full"
                      >
                        {fact.icon}
                      </motion.div>
                      <CardTitle className="text-2xl text-blue-900">{fact.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-700">{fact.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              variants={item} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => {setCursorEmoji("🚀"); setShowCursor(true);}}
              onMouseLeave={() => setShowCursor(false)}
            >
              {/* Changed the link from "/explore" to "/explore-page" to match your file structure */}
              <Link href="/explore-page">
  <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-lg h-16 px-12 rounded-full shadow-xl">
    <motion.span 
      animate={{ x: [-2, 2, -2] }} 
      transition={{ duration: 0.5, repeat: Infinity }}
      className="mr-2"
    >
      ✨
    </motion.span>
    Start Learning Journey
    <motion.span 
      animate={{ x: [2, -2, 2] }} 
      transition={{ duration: 0.5, repeat: Infinity }}
      className="ml-2"
    >
      ✨
    </motion.span>
  </Button>
</Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Games Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12 relative"
        >
          <motion.div
            className="absolute -right-20 top-10 text-6xl opacity-30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            🎮
          </motion.div>
          
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Interactive Learning Games
          </h2>
          <p className="text-center text-blue-700 text-lg max-w-2xl mx-auto mb-8">
            Discover our collection of specially designed games that make learning fun, engaging and tailored to different learning styles
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {GAMES.map((game, index) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: [-1, 1, -1],
                  transition: { rotate: { repeat: Infinity, duration: 0.5 } }
                }}
                onMouseEnter={() => {setCursorEmoji(game.icon); setShowCursor(true);}}
                onMouseLeave={() => setShowCursor(false)}
              >
                <Link href={game.href}>
                  <div className={`${game.color} p-6 rounded-2xl shadow-lg overflow-hidden relative h-64 flex flex-col items-center justify-center text-center transition-all duration-300`}>
                    <motion.div 
                      className="text-6xl mb-4"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {game.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">{game.title}</h3>
                    <p className="text-blue-700">Engaging learning experience designed for success</p>
                    <motion.div 
                      className="absolute bottom-4 right-4 text-blue-600"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      whileHover={{ scale: 1.4, rotate: 45 }}
                    >
                      <Rocket className="h-6 w-6" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* About Project Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-3xl p-8 shadow-xl"
        >
          <motion.div 
            className="absolute -top-10 -left-10 text-6xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            🧠
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-6">About Mind Bridge</h2>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="show"
              variants={container}
              viewport={{ once: true }}
            >
              <motion.div variants={item} className="relative">
                <Card className="bg-blue-50 border-none shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl text-blue-900">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent className="text-blue-700">
                    <p>Mind Bridge is dedicated to creating accessible, engaging learning experiences for children with autism. We believe every child deserves educational tools tailored to their unique needs and learning styles.</p>
                    <motion.div 
                      className="absolute bottom-4 right-4 text-4xl"
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      💙
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={item} className="relative">
                <Card className="bg-purple-50 border-none shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl text-purple-900">Our Approach</CardTitle>
                  </CardHeader>
                  <CardContent className="text-purple-700">
                    <p>We combine educational expertise with engaging design to create a platform that adapts to each child's needs. Our games employ visual learning, clear instructions, and positive reinforcement to create a supportive learning environment.</p>
                    <motion.div 
                      className="absolute bottom-4 right-4 text-4xl"
                      animate={{ rotate: [0, -10, 0, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      ✨
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          variants={container}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, index) => (
  <motion.div 
    key={member.name} 
    variants={item}
    onMouseEnter={() => {setCursorEmoji(member.avatar); setShowCursor(true);}}
    onMouseLeave={() => setShowCursor(false)}
  >
    <Card className={`${member.bgColor} border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full transform hover:-translate-y-2 rounded-2xl overflow-hidden`}>
      <CardHeader className="text-center pb-2">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-block overflow-hidden rounded-full w-32 h-32 mx-auto relative" // Increased from w-24 h-24 to w-32 h-32
        >
          {member.image && (
            <img 
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
        <CardTitle className="text-2xl text-blue-900 mt-2">{member.name}</CardTitle>
        <CardDescription className="text-blue-700 font-medium">
          {member.role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[120px] pr-4">
          <p className="text-blue-600 leading-relaxed">
            {member.description}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  </motion.div>
))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md border-blue-200">
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            <div className="space-y-4">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <HeartHandshake className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mind Bridge
                </span>
              </motion.div>
              <p className="text-blue-600">
                Empowering neurodiverse learners through innovative education
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/about" className="text-blue-600 hover:text-blue-800">About Us</Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/games" className="text-blue-600 hover:text-blue-800">All Games</Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact</Link>
                  </motion.div>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/blog" className="text-blue-600 hover:text-blue-800">Blog</Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/faq" className="text-blue-600 hover:text-blue-800">FAQ</Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/research" className="text-blue-600 hover:text-blue-800">Research</Link>
                  </motion.div>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Connect</h3>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                  <Button variant="ghost" size="icon" className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full h-12 w-12">
                    <FiGithub className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.2, rotate: -10 }}>
                  <Button variant="ghost" size="icon" className="bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full h-12 w-12">
                    <FiTwitter className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                  <Button variant="ghost" size="icon" className="bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-full h-12 w-12">
                    <FiLinkedin className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="border-t border-blue-200 mt-8 pt-8 text-center">
            <motion.p 
              className="text-blue-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              © 2024 Mind Bridge. All rights reserved.
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  );
}