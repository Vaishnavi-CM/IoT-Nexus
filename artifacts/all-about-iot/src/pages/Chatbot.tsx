import { useState, useRef, useEffect } from "react";
import { useGetChatHistory } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Trash2, Cpu, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const suggestions = [
  "What is IoT?",
  "Explain MQTT protocol",
  "How does a DHT22 sensor work?",
  "ESP32 vs Arduino — which to use?",
  "What is edge computing?",
  "IoT security best practices",
  "How does a PIR motion sensor work?",
  "What is TinyML?",
];

function renderMarkdown(content: string): string {
  marked.setOptions({ breaks: true, gfm: true });
  return marked.parse(content) as string;
}

export default function Chatbot() {
  const [sessionId] = useState(() => {
    const storageKey = "all-about-iot-chat-session";
    const storedSessionId = window.localStorage.getItem(storageKey);
    if (storedSessionId) return storedSessionId;

    const newSessionId = window.crypto.randomUUID();
    window.localStorage.setItem(storageKey, newSessionId);
    return newSessionId;
  });
  const { data: history, isLoading: isLoadingHistory } = useGetChatHistory({
    limit: 40,
    sessionId,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load chat history once
  useEffect(() => {
    if (history && messages.length === 0) {
      setMessages(
        history.map((m) => ({
          id: m.id.toString(),
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
    }
  }, [history]);

  // Auto-scroll on new messages
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput("");
    setIsStreaming(true);

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
    };
    const assistantId = `a_${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.content }
                    : m,
                ),
              );
            }
            if (data.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, streaming: false } : m,
                ),
              );
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Sorry, something went wrong. Please try again.",
                streaming: false,
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        ),
      );
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = async () => {
    abortRef.current?.abort();
    setIsClearing(true);
    setChatError(null);
    try {
      const response = await fetch(
        `/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(`Could not clear chat history (${response.status})`);
      }
      setMessages([]);
      setIsStreaming(false);
    } catch (error) {
      console.error("Failed to clear chat history", error);
      setChatError("Could not clear chat history. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-4xl flex flex-col"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            <Bot className="w-8 h-8 text-primary" />
            IoT Assistant
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Built-in expert on sensors, protocols, hardware &amp; more. Ask
            anything.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          disabled={isClearing}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Clear
        </Button>
      </div>
      {chatError && (
        <p role="alert" className="text-sm text-destructive mb-3">
          {chatError}
        </p>
      )}

      {/* Chat card */}
      <Card className="flex-1 border-white/10 bg-card/30 backdrop-blur shadow-2xl flex flex-col overflow-hidden relative min-h-0">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-60" />

        <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
          <div className="p-5">
            {/* Empty state */}
            {messages.length === 0 && !isLoadingHistory && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center pt-8 pb-4"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5 ring-2 ring-primary/20">
                  <Cpu className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-display mb-2">
                  Ask me anything about IoT
                </h3>
                <p className="text-muted-foreground max-w-md mb-7 text-sm">
                  I have built-in knowledge on sensors, microcontrollers,
                  protocols, cloud platforms, security, edge computing, ML in
                  IoT, and more — no internet required.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => sendMessage(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm hover:bg-primary/15 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 opacity-50" />
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-1 ring-1 ring-primary/30">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl max-w-[82%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground px-4 py-3 rounded-tr-sm"
                          : "bg-muted/40 border border-white/8 px-5 py-4 rounded-tl-sm"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div
                          className="prose prose-invert prose-sm max-w-none
                            prose-headings:font-bold prose-headings:text-foreground
                            prose-h2:text-base prose-h2:mt-3 prose-h2:mb-2
                            prose-h3:text-sm prose-h3:mt-2 prose-h3:mb-1
                            prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:my-1
                            prose-li:text-foreground/90 prose-li:my-0.5
                            prose-strong:text-foreground
                            prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:text-cyan-300
                            prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:text-xs
                            prose-table:text-xs prose-th:text-foreground prose-td:text-foreground/80
                            prose-hr:border-white/10"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(msg.content),
                          }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}

                      {/* Streaming cursor */}
                      {msg.streaming && (
                        <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm align-middle" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator while waiting for first token */}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/30">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-muted/40 border border-white/8 rounded-tl-sm flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="shrink-0 p-4 bg-background/60 border-t border-white/8 backdrop-blur-md">
          {/* Quick suggestions when chat is active */}
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {suggestions.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  disabled={isStreaming}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sensors, MQTT, edge computing..."
              className="flex-1 h-12 bg-card/50 border-white/10 rounded-full px-5 text-sm"
              disabled={isStreaming}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isStreaming}
              className="h-12 w-12 rounded-full shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground/50 mt-2">
            Built-in IoT knowledge base · No API key required · Always available
          </p>
        </div>
      </Card>
    </div>
  );
}
