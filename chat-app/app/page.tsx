import Link from "next/link";
import { Heart, MessageSquare, Sparkles, Shield } from "lucide-react";

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
            Your AI <span className="text-pink-accent">Companion</span>
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground leading-relaxed">
            A deeply personal AI that remembers your stories, matches your vibe,
            and grows with you over time.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card/50 px-3 py-4 ring-1 ring-border/50">
            <MessageSquare className="size-4 text-pink-accent" />
            <span className="text-xs text-muted-foreground text-center">
              Natural chat
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card/50 px-3 py-4 ring-1 ring-border/50">
            <Sparkles className="size-4 text-pink-accent" />
            <span className="text-xs text-muted-foreground text-center">
              Long-term memory
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card/50 px-3 py-4 ring-1 ring-border/50">
            <Heart className="size-4 text-pink-accent" />
            <span className="text-xs text-muted-foreground text-center">
              Custom personality
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-card/50 px-3 py-4 ring-1 ring-border/50">
            <Shield className="size-4 text-pink-accent" />
            <span className="text-xs text-muted-foreground text-center">
              Private & secure
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/chat"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-pink-accent px-8 text-sm font-medium text-pink-accent-foreground shadow-md shadow-pink-accent/20 transition-all hover:bg-pink-accent/90 hover:shadow-lg hover:shadow-pink-accent/30"
        >
          Get started
        </Link>

        <p className="text-xs text-muted-foreground/60">
          Free to use. Sign in to save your conversations.
        </p>
      </div>
    </div>
  );
}
