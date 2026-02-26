"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ── Typing dots ────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/8 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-lmuted"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Reaction pill ──────────────────────────────────────────────────────────────
function ReactionPill({ emoji, count, active }: { emoji: string; count: number; active?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
        active
          ? "border-mint/40 bg-mint/10 text-mint"
          : "border-white/10 bg-white/5 text-lmuted hover:border-white/20"
      }`}
    >
      <span>{emoji}</span>
      <span className="font-medium">{count}</span>
    </motion.button>
  );
}

// ── Individual message bubble ──────────────────────────────────────────────────
interface MessageProps {
  text: string;
  own: boolean;
  time: string;
  reactions?: { emoji: string; count: number; active?: boolean }[];
  delay?: number;
}

function Message({ text, own, time, reactions, delay = 0 }: MessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: own ? 20 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`flex ${own ? "justify-end" : "justify-start"}`}
    >
      {!own && (
        <div className="mr-2.5 mt-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lpurple/60 to-lsteel/60 text-xs font-bold text-lbg">
          J
        </div>
      )}
      <div className={`flex max-w-[72%] flex-col gap-1 ${own ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            own
              ? "rounded-br-sm bg-gradient-to-r from-mint/90 to-lsteel/90 font-medium text-lbg"
              : "rounded-bl-sm bg-white/8 text-white/90"
          }`}
        >
          {text}
        </div>
        {reactions && (
          <div className="flex gap-1 px-1">
            {reactions.map((r) => (
              <ReactionPill key={r.emoji} {...r} />
            ))}
          </div>
        )}
        <span className="px-1 text-[10px] text-lmuted/60">{time}</span>
      </div>
      {own && (
        <div className="ml-2.5 mt-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mint/60 to-lsteel/60 text-xs font-bold text-lbg">
          M
        </div>
      )}
    </motion.div>
  );
}

// ── Full chat preview section ──────────────────────────────────────────────────
export function ChatPreviewSection() {
  const messages: MessageProps[] = [
    { text: "Just tried Chatly for the first time 🤯", own: false, time: "3:41 PM", delay: 0.1 },
    { text: "The UI is insane. How is this free?", own: false, time: "3:41 PM", delay: 0.2 },
    {
      text: "I know right?? Real-time, reactions, groups — all of it 🔥",
      own: true,
      time: "3:42 PM",
      reactions: [{ emoji: "❤️", count: 2, active: true }, { emoji: "🔥", count: 3 }],
      delay: 0.35,
    },
    { text: "The group chat feature alone is worth it", own: false, time: "3:43 PM", delay: 0.5 },
    { text: "Shipping this for my internship submission 💪", own: true, time: "3:43 PM", delay: 0.65 },
  ];

  return (
    <section id="preview" className="relative bg-lbg py-28">
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 md:grid-cols-2">
          {/* Left – copy */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <span className="w-fit rounded-full border border-lpurple/20 bg-lpurple/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-lpurple uppercase">
              Live demo feeling
            </span>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Messaging that{" "}
              <span className="bg-gradient-to-r from-lpurple via-lsteel to-mint bg-clip-text text-transparent">
                flows.
              </span>
            </h2>
            <p className="text-base leading-relaxed text-lmuted">
              Every interaction is buttery smooth. Reactions update live, typing
              indicators breathe naturally, and messages feel instant — because
              they are.
            </p>

            <ul className="flex flex-col gap-3">
              {[
                "Emoji reactions that sync in real time",
                "Animated three-dot typing indicators",
                "Online/offline presence with last seen",
                "Soft-delete with deleted message placeholder",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-lmuted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right – chat window */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 translate-y-6 scale-90 rounded-3xl bg-gradient-to-br from-lpurple/15 via-mint/10 to-lsteel/15 blur-3xl" />

            <div className="overflow-hidden rounded-3xl border border-white/8 bg-lcard shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lpurple/70 to-lsteel/70 text-sm font-bold text-lbg">
                      J
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-lcard bg-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Jamie</p>
                    <p className="text-xs font-medium text-mint">Active now</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {["bg-red-500/60", "bg-yellow-400/60", "bg-green-400/60"].map((c) => (
                    <div key={c} className={`h-3 w-3 rounded-full ${c}`} />
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-3 px-5 py-5">
                {messages.map((m, i) => (
                  <Message key={i} {...m} />
                ))}
                <TypingDots />
              </div>

              {/* Input */}
              <div className="border-t border-white/5 px-5 py-3.5">
                <div className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2.5">
                  <span className="flex-1 text-xs text-lmuted/50">Message Jamie…</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-mint to-lsteel shadow-md shadow-mint/30"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-lbg" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
