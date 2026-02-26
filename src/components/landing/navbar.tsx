"use client";

import { motion } from "framer-motion";
import { MessageCircle, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Preview", href: "#preview" },
    { label: "Get Started", href: "#cta" },
  ];

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 z-50 w-full border-b border-white/5 bg-lbg/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mint to-lsteel shadow-lg shadow-mint/25">
            <MessageCircle className="h-5 w-5 text-lbg" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Chatly</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-lmuted transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="text-sm text-lmuted transition-colors duration-200 hover:text-white"
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/sign-up"
              className="rounded-full bg-gradient-to-r from-mint via-lpurple to-lsteel px-5 py-2 text-sm font-semibold text-lbg shadow-lg shadow-mint/20 transition-shadow duration-300 hover:shadow-mint/40"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="text-lmuted md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/5 bg-lbg px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-lmuted hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <Link href="/sign-in" className="text-sm text-lmuted hover:text-white">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-gradient-to-r from-mint to-lsteel px-5 py-2 text-center text-sm font-semibold text-lbg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
