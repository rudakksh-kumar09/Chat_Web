"use client";

import { useTheme, type Theme } from "@/providers/theme-provider";

const themes: { id: Theme; color: string; label: string; border?: string }[] = [
  { id: "dark",   color: "#0FFCBE", label: "Dark" },
  { id: "white",  color: "#FFFFFF", label: "White", border: "#D1D5DB" },
  { id: "sunset", color: "#FF5841", label: "Sunset" },
  { id: "violet", color: "#C53678", label: "Violet" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted/70 border border-border px-2.5 py-1.5">
      {themes.map((t) => (
        <button
          key={t.id}
          title={`${t.label} theme`}
          onClick={() => setTheme(t.id)}
          className="relative h-5 w-5 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
          style={{
            backgroundColor: t.color,
            border: t.border ? `1.5px solid ${t.border}` : "1.5px solid transparent",
            boxShadow:
              theme === t.id
                ? `0 0 0 2px hsl(var(--background)), 0 0 0 3.5px ${t.color}`
                : "none",
            opacity: theme === t.id ? 1 : 0.55,
            transform: theme === t.id ? "scale(1.15)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
