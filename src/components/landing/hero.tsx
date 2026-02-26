"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

// ── Animated floating blob background ─────────────────────────────────────────
function GradientBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Mint blob – top left */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-mint/10 blur-[100px]"
      />
      {/* Purple blob – top right */}
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -top-20 -right-40 h-[450px] w-[450px] rounded-full bg-lpurple/10 blur-[100px]"
      />
      {/* Steel blue blob – bottom center */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-lsteel/8 blur-[100px]"
      />
    </div>
  );
}

// ── Floating chat mockup ────────────────────────────────────────────────────────
function FloatingChatMockup() {
  const bubbles = [
    { text: "Hey! Have you tried Chatly?", own: false, delay: 0.2 },
    { text: "It's insanely fast 🚀", own: false, delay: 0.4 },
    { text: "Just signed up — wow this UI is clean 🔥", own: true, delay: 0.6 },
    { text: "Real-time too! No lag at all", own: true, delay: 0.8 },
    { text: "Group chats and reactions 👍❤️ yesss", own: false, delay: 1.0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-sm"
    >
      {/* Glow ring behind card */}
      <div className="absolute inset-0 -z-10 translate-y-4 scale-95 rounded-3xl bg-gradient-to-br from-mint/20 via-lpurple/10 to-lsteel/20 blur-2xl" />

      {/* Card */}
      <div className="overflow-hidden rounded-3xl border border-white/8 bg-lcard shadow-2xl shadow-black/40 backdrop-blur-sm">
        {/* Card header */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.03] px-4 py-3.5">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-mint/80 to-lsteel/80 text-sm font-bold text-lbg">
              A
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-lcard bg-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Alex Chen</p>
            <p className="text-xs font-medium text-mint">Active now</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 px-4 py-4">
          {bubbles.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: b.own ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: b.delay }}
              className={`flex ${b.own ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                  b.own
                    ? "rounded-br-sm bg-gradient-to-r from-mint/90 to-lsteel/90 font-medium text-lbg"
                    : "rounded-bl-sm bg-white/8 text-white/90"
                }`}
              >
                {b.text}
              </span>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex justify-start"
          >
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="h-1.5 w-1.5 rounded-full bg-lmuted"
                />
              ))}
            </span>
          </motion.div>
        </div>

        {/* Input bar */}
        <div className="border-t border-white/5 px-4 py-3">
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <span className="flex-1 text-xs text-lmuted/60">Message Alex…</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-mint to-lsteel">
              <ArrowRight className="h-3 w-3 text-lbg" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Hero section ───────────────────────────────────────────────────────────────
export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
    }),
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-lbg pt-20"
    >
      <GradientBlobs />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        {/* Left – copy */}
        <div className="flex flex-col items-start gap-6">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-center gap-2 rounded-full border border-mint/20 bg-mint/5 px-4 py-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-mint" />
            <span className="text-xs font-semibold tracking-wide text-mint">
              Real-time · Lightning fast · Beautiful
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl"
          >
            <span className="text-white">Chat like</span>
            <br />
            <span className="bg-gradient-to-r from-mint via-lpurple to-lsteel bg-clip-text text-transparent">
              never before.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="max-w-md text-base leading-relaxed text-lmuted"
          >
            Chatly is a premium real-time messaging platform with group chats,
            reactions, typing indicators, and a stunning UI — built for people
            who care about experience.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-mint via-lpurple to-lsteel px-6 py-3 text-sm font-bold text-lbg shadow-xl shadow-mint/30 transition-shadow duration-300 hover:shadow-mint/50"
              >
                Start chatting free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-in"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Sign in
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {["#0FFCBE", "#C5ADC5", "#B2B5E0", "#6EE7B7"].map((c, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-lbg bg-lcard ring-1 ring-white/10"
                  style={{ background: `${c}33` }}
                />
              ))}
            </div>
            <p className="text-xs text-lmuted">
              <span className="font-semibold text-white">Join the conversation</span> today
            </p>
          </motion.div>
        </div>

        {/* Right – mockup */}
        <motion.div style={{ y }} className="flex justify-center">
          <FloatingChatMockup />
        </motion.div>
      </div>
    </section>
  );
}
