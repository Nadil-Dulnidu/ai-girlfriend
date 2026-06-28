"use client";

import { useState, useEffect } from "react";
import { Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AgentSettings } from "@/types/db";

export function AgentSettingsDrawer() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AgentSettings | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [memories, setMemories] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open && !settings) {
      loadSettings();
    }
  }, [open]);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data: AgentSettings = await res.json();
      setSettings(data);
      setName(data.girlfriend_name);
      setMemories(data.memories);
      setDescription(data.description);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          girlfriend_name: name,
          memories,
          description,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const data: AgentSettings = await res.json();
      setSettings(data);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          />
        }
      >
        <Settings className="size-4" />
        Settings
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] max-w-[85vw] sm:w-[380px] sm:max-w-[380px]">
        <SheetHeader className="px-5 pt-5 pb-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-pink-accent" />
            Agent Settings
          </SheetTitle>
          <SheetDescription className="text-xs">
            Shape your companion&apos;s identity. Changes apply to all future
            messages.
          </SheetDescription>
        </SheetHeader>

        <Separator className="mt-4" />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-5 py-5">
            {/* Name field */}
            <div className="space-y-2">
              <label
                htmlFor="girlfriend-name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>
              <p className="text-[11px] text-muted-foreground leading-snug">
                What should your companion be called?
              </p>
              <Input
                id="girlfriend-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aria, Luna, Kai..."
                maxLength={50}
              />
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Personality description
              </label>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Describe the vibe, tone, and traits you want.
              </p>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A caring, warm, and witty AI companion who remembers everything about you."
                rows={4}
                maxLength={1000}
              />
            </div>

            {/* Memories field */}
            <div className="space-y-2">
              <label
                htmlFor="memories"
                className="text-sm font-medium text-foreground"
              >
                Memories
              </label>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Things your companion should know about you or your
                relationship.
              </p>
              <Textarea
                id="memories"
                value={memories}
                onChange={(e) => setMemories(e.target.value)}
                placeholder="e.g. loves coffee, works as a designer, has a cat named Mochi, we met at a bookshop..."
                rows={4}
                maxLength={2000}
              />
              <p className="text-[11px] text-muted-foreground/70">
                Real or made-up memories injected into the conversation context.
              </p>
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim() || !description.trim()}
              className="w-full"
            >
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
