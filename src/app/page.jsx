import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden">
      
      {/* Glow background */}
      <div className="absolute -top-40 h-[500px] w-[500px] rounded-full bg-yellow-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-yellow-400/10 blur-[100px]" />

      <div className="relative z-10 text-center space-y-6 px-4">
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          Build Your <span className="text-yellow-400">Esports Legacy</span>
        </h1>

        <p className="mx-auto max-w-xl text-zinc-400">
          Form squads. Dominate tournaments. Rise through the ranks.
          Your competitive journey starts here.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link href="/login">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
