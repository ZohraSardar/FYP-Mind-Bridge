import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { cn } from "@/lib/utils"; // Ensure you have this utility

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  className?: string;
}

export default function GameCard({ 
  title, 
  description, 
  icon, 
  href,
  className 
}: GameCardProps) {
  return (
    <Link href={href}>
      <Card className={cn(
        "cursor-pointer hover:bg-accent transition-colors group",
        "hover:shadow-lg transform transition-all duration-300",
        className
      )}>
        <CardHeader className="text-center">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}