"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
        render={<Button variant="ghost" size="sm" className="w-full justify-start gap-2" />}
      >
        <Settings className="size-4" />
        Settings
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Agent Settings</SheetTitle>
          <SheetDescription>
            Customize your AI companion&apos;s personality.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            <div className="space-y-2">
              <label
                htmlFor="girlfriend-name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>
              <Input
                id="girlfriend-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aria"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Personality description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A caring, warm, and witty AI companion..."
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="memories"
                className="text-sm font-medium text-foreground"
              >
                Memories
              </label>
              <Textarea
                id="memories"
                value={memories}
                onChange={(e) => setMemories(e.target.value)}
                placeholder="Comma-separated things to remember... e.g. loves coffee, works as a designer, has a cat named Mochi"
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                Real or made-up memories injected into the conversation context.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !name.trim() || !description.trim()}
              className="mt-2"
            >
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
