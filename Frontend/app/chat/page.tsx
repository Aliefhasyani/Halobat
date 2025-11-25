"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CustomBubbleBackground from "@/components/custom/bubble-background";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import DrugCard from "@/components/custom/drug-card";
import { Skeleton } from "@/components/ui/skeleton";

type Recommendation = {
  id: string;
  name: string;
  price?: number;
  picture?: string | null;
  manufacturer?: string | null;
  quantity?: number;
};

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  loading?: boolean; // when true, render a skeleton placeholder for this assistant message
  recommendedDrugs?: Recommendation[];
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMessages([]), []);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    setTimeout(
      () => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }),
      40
    );
  }, [messages]);

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

    // push a skeleton assistant message so the user sees a loading placeholder
    const skeletonId = String(Date.now()) + "-l";
    const skeletonMessage: Message = {
      id: skeletonId,
      sender: "assistant",
      text: "",
      loading: true,
    };
    setMessages((prev) => [...prev, skeletonMessage]);

    try {
      const apiUrl =
        (process.env.NEXT_PUBLIC_BASE_URL &&
          `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "")}/api/chat`) ||
        "/api/chat";
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!resp.ok) throw new Error((await resp.text()) || "Unknown error");
      const body = await resp.json();

      const diagnosisText =
        (body &&
          (body.diagnosis ?? body.data ?? body.answer ?? body.message)) ||
        "No response";
      const assistantMessage: Message = {
        id: String(Date.now()) + "-a",
        sender: "assistant",
        text: diagnosisText,
      };
      // replace the skeleton message with the real assistant message
      setMessages((prev) =>
        prev.map((m) => (m.id === skeletonId ? assistantMessage : m))
      );

      if (
        body &&
        Array.isArray(body.recommended_drugs) &&
        body.recommended_drugs.length > 0
      ) {
        const recMsg: Message = {
          id: String(Date.now()) + "-r",
          sender: "assistant",
          // leave text empty so we only show the drug cards (no label)
          text: "",
          recommendedDrugs: body.recommended_drugs,
        };
        // append the recommendations AFTER the assistant message replacement above
        setTimeout(() => setMessages((prev) => [...prev, recMsg]), 0);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to get an answer");
      // replace skeleton with a helpful error message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === skeletonId
            ? {
                id: String(Date.now()) + "-err",
                sender: "assistant",
                text: "Sorry, something went wrong while contacting the chat service.",
                loading: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CustomBubbleBackground className="min-h-screen py-4">
        <div className="max-w-[1100px] mx-auto px-6">
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

          <div className="text-center mt-6 mb-12">
            <div className="text-2xl text-muted-foreground mb-2"></div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Ask our AI about your complaint!
            </h1>
            <p className="mt-3 text-muted-foreground text-sm">
              Get a quick suggestion for likely diagnoses and medications (for
              reference only).
            </p>
          </div>

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
                onClick={() => setInput(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="max-w-[800px] mx-auto">
            <div className="mt-8">
              <div
                ref={messagesRef}
                className="h-[46vh] md:h-[50vh] overflow-y-auto space-y-3 px-2 pb-6"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${
                      m.recommendedDrugs && m.recommendedDrugs.length > 0
                        ? "p-0 bg-transparent border-0"
                        : `p-3 rounded-md ${
                            m.sender === "assistant"
                              ? "bg-white/90 border"
                              : "bg-primary text-primary-foreground"
                          }`
                    }`}
                  >
                    {/* Only render the text skeleton/contents when there's text or the message is loading */}
                    {(m.loading || m.text) && (
                      <div className="text-sm whitespace-pre-wrap">
                        {m.loading ? (
                          <div className="space-y-2 max-w-[86%]">
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        ) : (
                          m.text
                        )}
                      </div>
                    )}
                    {m.recommendedDrugs && m.recommendedDrugs.length > 0 && (
                      // render the cards without a bubble background so only the cards are visible
                      <div className="mt-3">
                        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                          {m.recommendedDrugs.map((d) => (
                            <div key={d.id} className="min-w-[180px] shrink-0">
                              <DrugCard
                                id={d.id}
                                name={d.name}
                                price={d.price ?? ""}
                                picture={d.picture}
                                manufacturer={d.manufacturer}
                                dosage={null}
                                type={"generic"}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="fixed left-1/2 bottom-6 z-40 w-[min(96%,1100px)] -translate-x-1/2">
          <div className="max-w-[800px] mx-auto">
            <div className="mb-4 border border-rose-200 bg-rose-50/60 px-4 py-3 rounded-lg flex items-start gap-4">
              <div className="text-2xl text-rose-500"></div>
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
                aria-busy={loading}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CustomBubbleBackground>
    </>
  );
}
