"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section id="cta" className="relative overflow-hidden bg-lbg py-32">
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-mint/15 via-lpurple/10 to-lsteel/15 blur-[80px]"
        />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/8 blur-[60px]" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-lpurple/8 blur-[60px]" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/8 px-5 py-2"
        >
          <Sparkles className="h-3.5 w-3.5 text-mint" />
          <span className="text-xs font-semibold text-mint">100% Free — No credit card needed</span>
        </motion.div>

        <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
          Ready to{" "}
          <span className="bg-gradient-to-r from-mint via-lpurple to-lsteel bg-clip-text text-transparent">
            connect?
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-lg text-lmuted">
          Join thousands of people already using Chatly. Sign up in seconds —
          no forms, no friction.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/sign-up"
              className="relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-mint via-lpurple to-lsteel px-8 py-3.5 text-base font-bold text-lbg shadow-2xl shadow-mint/30 transition-shadow duration-300 hover:shadow-mint/50"
            >
              {/* Shine overlay */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
              Create free account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/sign-in"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10"
            >
              I already have an account
            </Link>
          </motion.div>
        </div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-lmuted"
        >
          {["End-to-end secure", "Real-time sync", "No ads ever"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-mint" />
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
