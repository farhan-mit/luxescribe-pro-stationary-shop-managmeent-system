/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, FormEvent } from "react";
import { Sparkles, X, Send, ArrowRight, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { Product } from "../types";

interface CoPilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  showNotification: (message: string, type?: "success" | "error" | "info") => void;
}

interface Message {
  id: string;
  sender: "user" | "oracle";
  text: string;
  timestamp: Date;
}

export default function CoPilotPanel({ isOpen, onClose, products, showNotification }: CoPilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "oracle",
      text: "Greetings. I am **ScribeOracle AI**, your resident boutique brand counselor and inventory strategist. How may I coordinate your luxury enterprise affairs today?",
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  // Compile a small inventory brief to pass as high-context data to the Oracle!
  const getInventoryBrief = () => {
    const lowStock = products.filter((p) => p.stock <= 5);
    const topSellers = [...products].sort((a, b) => b.soldQuantity - a.soldQuantity).slice(0, 3);
    const totalWares = products.reduce((acc, p) => acc + p.stock, 0);

    return JSON.stringify({
      totalUniqueItems: products.length,
      totalWaresInStock: totalWares,
      lowStockSkus: lowStock.map((p) => `${p.sku} (${p.name}: ${p.stock} left)`),
      topArtisanItems: topSellers.map((p) => `${p.name} (Sold: ${p.soldQuantity})`),
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          currentInventoryBrief: getInventoryBrief(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch response from ScribeOracle.");
      }

      const resData = await response.json();

      const oracleMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "oracle",
        text: resData.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, oracleMsg]);
    } catch (err: any) {
      showNotification(err.message || "Oracle query failed.", "error");
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: "oracle",
          text: `*System Notice:* Unable to coordinate with my cognitive core. Please verify your Gemini API credentials via the Studio panel.\n\nError detail: \`${err.message}\``,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleSendMessage(inputVal);
  };

  const prePromptOptions = [
    {
      label: "Stock Replenishment Strategy",
      prompt: "Analyze our inventory stock status, focus on low stock SKUs, and give me a 3-step prioritized restocking strategy with recommended quantities.",
      icon: <AlertTriangle className="w-3.5 h-3.5 " />,
    },
    {
      label: "VIP Customer Engagement Ideation",
      prompt: "Give me creative boutique customer engagement ideas specifically tailored for Elite/Platinum members: virtual writing workshops, personalized ink blending, and special anniversary gifts.",
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      label: "Boutique Trend Insights",
      prompt: "Suggest three high-end luxury items (e.g. specialized inks, premium paperweights, imported writing journals) we should introduce to enhance our brand prestige.",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-zinc-200 outline-none shadow-2xl flex flex-col font-sans transition-all duration-300 animate-in slide-in-from-right">
      {/* Header */}
      <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-950">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-zinc-100 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-light text-sm uppercase tracking-widest leading-none">ScribeOracle AI</h3>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400">Resident Business Strategist</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white hover:bg-white/15 p-1 rounded transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50 border-b border-zinc-100">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <span className="text-[8px] uppercase tracking-widest text-zinc-400 mb-1 font-semibold">
              {m.sender === "user" ? "Merchant Operator" : "Scribe Oracle"}
            </span>
            <div
              className={`p-4 text-xs font-serif leading-relaxed tracking-wide shadow-sm max-w-[90%] whitespace-pre-wrap ${
                m.sender === "user"
                  ? "bg-zinc-900 text-white rounded-none border border-zinc-950"
                  : "bg-white text-zinc-800 rounded-none border border-zinc-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[8px] uppercase tracking-widest text-zinc-400 mb-1 font-semibold animate-pulse">
              Consulting ScribeOracle...
            </span>
            <div className="bg-white border border-zinc-200 p-4 rounded-none flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full animate-bounce duration-300"></span>
              <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full animate-bounce [animation-delay:0.1s] duration-300"></span>
              <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full animate-bounce [animation-delay:0.2s] duration-300"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pre-Prompt Options */}
      {messages.length === 1 && (
        <div className="px-6 py-4 border-t border-zinc-200 bg-white space-y-2">
          <span className="block text-[8px] uppercase font-bold text-zinc-400 tracking-widest mb-1">
            Recommend Consultations
          </span>
          <div className="space-y-1.5">
            {prePromptOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(opt.prompt)}
                className="w-full text-left border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 p-2.5 flex items-center justify-between text-[10px] tracking-wider uppercase font-semibold text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer rounded-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-zinc-200 flex gap-2 font-sans">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Consult the Oracle on boutique affairs..."
          className="flex-1 bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-950 focus:bg-white transition-all rounded-none font-semibold"
        />
        <button
          type="submit"
          disabled={loading || !inputVal.trim()}
          className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-950 disabled:bg-zinc-300 disabled:border-zinc-300 px-4 py-2 text-xs uppercase font-bold tracking-widest active:scale-95 transition-all cursor-pointer flex items-center justify-center rounded-none shadow-sm"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
