import Link from "next/link";
import { Heart, MessageSquare, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background via-background to-pink-accent/5 px-4">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex size-20 items-center justify-center rounded-3xl bg-pink-accent/10 ring-1 ring-pink-accent/20 shadow-lg shadow-pink-accent/5">
          <Heart className="size-10 text-pink-accent" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">
            Meet <span className="text-pink-accent">Aria</span>
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Your personal AI companion who remembers everything about you.
            Warm, witty, and always here.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-pink-accent" />
            <span>Natural conversation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-pink-accent" />
            <span>Remembers your stories</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="size-3.5 text-pink-accent" />
            <span>Customizable personality</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/chat"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-pink-accent px-6 text-sm font-medium text-pink-accent-foreground shadow-md shadow-pink-accent/20 transition-all hover:bg-pink-accent/90 hover:shadow-lg hover:shadow-pink-accent/30"
        >
          Start chatting
        </Link>

        <p className="text-xs text-muted-foreground/60">
          Free to use. No credit card required.
        </p>
      </div>
    </div>
  );
}
