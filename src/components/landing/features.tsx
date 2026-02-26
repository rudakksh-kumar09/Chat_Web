"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Users,
  Smile,
  Zap,
  WifiOff,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-time Messaging",
    description:
      "Messages land instantly. No polling, no delays — powered by Convex's live database subscriptions.",
    color: "from-mint/20 to-mint/5",
    glow: "group-hover:shadow-mint/20",
    iconColor: "text-mint",
    border: "group-hover:border-mint/30",
  },
  {
    icon: Users,
    title: "Group Chats",
    description:
      "Create group conversations with any number of people. See member count and manage your crews.",
    color: "from-lpurple/20 to-lpurple/5",
    glow: "group-hover:shadow-lpurple/20",
    iconColor: "text-lpurple",
    border: "group-hover:border-lpurple/30",
  },
  {
    icon: Smile,
    title: "Message Reactions",
    description:
      "React with 👍 ❤️ 😂 😮 😢 — tap to toggle. Reactions update live for everyone in the conversation.",
    color: "from-lsteel/20 to-lsteel/5",
    glow: "group-hover:shadow-lsteel/20",
    iconColor: "text-lsteel",
    border: "group-hover:border-lsteel/30",
  },
  {
    icon: MessageCircle,
    title: "Typing Indicators",
    description:
      "Real animated dots show when someone's composing. Feels exactly like iMessage or WhatsApp.",
    color: "from-mint/15 to-lpurple/10",
    glow: "group-hover:shadow-mint/15",
    iconColor: "text-mint",
    border: "group-hover:border-mint/25",
  },
  {
    icon: WifiOff,
    title: "Offline Resilience",
    description:
      "Auto-retry with exponential back-off. Failed messages surface a retry button so nothing is lost.",
    color: "from-lpurple/20 to-lsteel/10",
    glow: "group-hover:shadow-lpurple/15",
    iconColor: "text-lpurple",
    border: "group-hover:border-lpurple/25",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description:
      "Clerk-powered authentication with social logins. Every route is protected and user data is isolated.",
    color: "from-lsteel/20 to-mint/10",
    glow: "group-hover:shadow-lsteel/15",
    iconColor: "text-lsteel",
    border: "group-hover:border-lsteel/25",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-lbg py-28">
      {/* Divider glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="rounded-full border border-lsteel/20 bg-lsteel/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-lsteel uppercase">
            Everything you need
          </span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Built different.{" "}
            <span className="bg-gradient-to-r from-mint via-lpurple to-lsteel bg-clip-text text-transparent">
              Feels different.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-lmuted">
            Every feature is thoughtfully designed. From micro-animations to
            smart error handling — Chatly is polished end-to-end.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-lcard p-6 shadow-xl shadow-black/30 transition-all duration-300 ${f.glow} hover:shadow-2xl ${f.border}`}
              >
                {/* Gradient blob inside card */}
                <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${f.color} blur-2xl`} />

                {/* Icon */}
                <div className={`relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/5`}>
                  <Icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>

                {/* Text */}
                <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-lmuted">{f.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
