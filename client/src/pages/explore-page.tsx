import { motion } from "framer-motion";
import GameCard from "@/components/common/GameCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Animation variants for staggered transitions
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Categories data
const CATEGORIES = [
  {
    title: "Learning Games",
    description: "Interactive games designed to make learning fun and engaging",
    icon: "🎮",
    color: "bg-blue-100 hover:bg-blue-200",
  },
  {
    title: "Visual Learning",
    description: "Games that help develop visual recognition and memory",
    icon: "👁️",
    color: "bg-purple-100 hover:bg-purple-200",
  },
  {
    title: "Skill Development",
    description: "Activities to improve various cognitive and motor skills",
    icon: "🧩",
    color: "bg-green-100 hover:bg-green-200",
  },
];

// Games data
const GAMES = [
  {
    title: "Basic Mathematics",
    description: "Learn counting and simple arithmetic through interactive exercises",
    icon: "🎲",
    href: "/game/math",
    color: "bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300",
  },
  {
    title: "Object Identification",
    description: "Learn about everyday objects and their safety levels",
    icon: "🖼",
    href: "/game/objects",
    color: "bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300",
  },
  {
    title: "Speech Therapy",
    description: "Practice common gestures and expressions with voice guidance",
    icon: "🗣",
    href: "/game/speech",
    color: "bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300",
  },
  {
    title: "Shapes Recognition",
    description: "Learn to identify different shapes and patterns",
    icon: "🎨",
    href: "/game/colorshape",
    color: "bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300",
  },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Categories Section */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={container}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            variants={item}
            className="text-4xl font-bold text-blue-900 mb-6"
          >
            Explore Learning Games
          </motion.h1>
          <motion.p
            variants={item}
            className="text-lg text-blue-700 mb-12"
          >
            Discover our collection of educational games designed specifically for children with autism
          </motion.p>

          {/* Categories Grid */}
          <motion.div
            variants={container}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {CATEGORIES.map((category) => (
              <motion.div key={category.title} variants={item}>
                <Card className={`h-full ${category.color} border-0 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden`}>
                  <CardHeader>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl mb-4 inline-block bg-white/50 p-4 rounded-full"
                    >
                      {category.icon}
                    </motion.div>
                    <CardTitle className="text-2xl text-blue-900">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700">{category.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Games Section */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={container}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={item}
            className="text-3xl font-bold text-blue-900 text-center mb-8"
          >
            Available Games
          </motion.h2>
          <motion.div
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {GAMES.map((game, index) => (
              <motion.div
                key={game.title}
                variants={item}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GameCard
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  href={game.href}
                  className={game.color}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}