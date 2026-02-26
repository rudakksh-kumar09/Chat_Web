"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-lbg py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-mint to-lsteel">
            <MessageCircle className="h-3.5 w-3.5 text-lbg" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-white">Chatly</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {[
            { label: "Features", href: "#features" },
            { label: "Preview", href: "#preview" },
            { label: "Sign up", href: "/sign-up" },
            { label: "Sign in", href: "/sign-in" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-xs text-lmuted transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
