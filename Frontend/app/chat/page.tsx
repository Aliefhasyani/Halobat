"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
// Avatar not required in this layout — kept the page minimal & focused on input
import CustomBubbleBackground from "@/components/custom/bubble-background";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Card/Textarea not required in this layout
import { Send, ArrowLeft } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // message container ref so we can auto-scroll when messages change
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // start with an empty conversation for the UI in this layout
    setMessages([]);
  }, []);

  // autoscroll to bottom whenever messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // no scrolling behaviour in this layout (we show a short preview)

  async function send() {
    const text = input.trim();
    if (!text) return;

    setError(null);

    const userMessage: Message = {
      id: String(Date.now()) + "-u",
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Unknown error");
      }

      const body = await resp.json();
      const answer =
        (body && (body.data ?? body.answer ?? body.message)) || "No response";

      const assistantMessage: Message = {
        id: String(Date.now()) + "-a",
        sender: "assistant",
        text: answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to get an answer");
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()) + "-err",
          sender: "assistant",
          text: "Sorry, something went wrong while contacting the chat service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <CustomBubbleBackground className="min-h-screen py-4">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* top-left small back icon placeholder */}
        <div className="flex items-start justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 md:p-4 rounded-full"
            >
              <ArrowLeft className="h-4 w-4 text-pink-500" />
            </Button>
          </div>
          <div className="hidden md:block" />
        </div>

        {/* centered header */}
        <div className="text-center mt-6 mb-12">
          <div className="text-2xl text-muted-foreground mb-2">✨</div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Ask our AI about your complaint!
          </h1>
          <p className="mt-3 text-muted-foreground text-sm">
            Get a quick suggestion for likely diagnoses and medications (for
            reference only).
          </p>
        </div>

        {/* suggestion chips */}
        <div className="flex justify-center gap-4 flex-wrap mb-10 text-sm">
          {[
            "Saya demam, merasa lemah, atau menggigil",
            "Saya mengalami batuk, pilek, atau sesak napas",
            "Saya mengalami sakit kepala, pusing, atau migrain",
          ].map((s) => (
            <Button
              key={s}
              variant="outline"
              size="sm"
              className="bg-white/60 border rounded-md px-4 py-3 text-sm text-muted-foreground shadow-sm hover:shadow-md"
              onClick={() => {
                setInput(s);
              }}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* chat input area centered */}
        <div className="max-w-[800px] mx-auto">
          {/* chat results / scrollable conversation */}
          <div className="mt-8">
            <div
              ref={messagesRef}
              className="h-[46vh] md:h-[50vh] overflow-y-auto space-y-3 px-2 pb-6"
            >
              {/* show messages in order */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-md ${
                    m.sender === "assistant"
                      ? "bg-white/90 border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-destructive text-center">{error}</div>
      )}

      {/* fixed input bar at bottom of viewport */}
      <div className="fixed left-1/2 bottom-6 z-40 w-[min(96%,1100px)] -translate-x-1/2">
        <div className="max-w-[800px] mx-auto">
          {/* bottom warning banner */}
          <div className="mb-4 border border-rose-200 bg-rose-50/60 px-4 py-3 rounded-lg flex items-start gap-4">
            <div className="text-2xl text-rose-500">⚠️</div>
            <div className="text-sm text-rose-700">
              Informasi dari AI ini bukan pengganti konsultasi dokter. Selalu
              konsultasikan ke tenaga medis sebelum menggunakan obat!
            </div>
          </div>
          <div className="bg-white/95 border rounded-lg shadow-lg p-3 flex items-center gap-3">
            <Input
              placeholder="Tanyakan apapun kepada saya !"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              className="bg-transparent shadow-none border-0 text-sm placeholder:text-muted-foreground"
            />

            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              variant="ghost"
              size="icon"
              className="text-primary"
            >
              <Send className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </CustomBubbleBackground>
  );
}
