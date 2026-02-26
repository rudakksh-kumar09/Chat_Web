"use client";

import { UserButton } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTheme, type Theme } from "@/providers/theme-provider";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Loader2 } from "lucide-react";

function getClerkAppearance(theme: Theme) {
  if (theme === "white") {
    return {
      variables: { colorPrimary: "#2F6CE0", borderRadius: "0.75rem" },
    };
  }
  const palette = {
    dark:   { bg: "#181C3A", bgDeep: "#0F1226", primary: "#0FFCBE" },
    sunset: { bg: "#231210", bgDeep: "#180C08", primary: "#FF5841" },
    violet: { bg: "#1E1026", bgDeep: "#150D18", primary: "#C53678" },
  }[theme as "dark" | "sunset" | "violet"];

  return {
    variables: {
      colorBackground: palette.bg,
      colorPrimary: palette.primary,
      colorText: "#f0f0f8",
      colorTextSecondary: "#9CA3AF",
      colorNeutral: "#B2B5E0",
      colorDanger: "#f87171",
      colorInputBackground: palette.bgDeep,
      colorInputText: "#f0f0f8",
      borderRadius: "0.75rem",
    },
    elements: {
      userButtonPopoverCard: "border border-white/8 shadow-2xl shadow-black/60",
      userButtonPopoverHeader: "border-b border-white/8",
      userButtonPopoverFooter: "border-t border-white/8",
      userButtonPopoverActionButton: "hover:bg-white/5 text-[#f0f0f8]",
      userButtonPopoverActionButtonText: "text-[#f0f0f8]",
      userButtonPopoverActionButtonIcon: "text-[#9CA3AF]",
      userPreviewTextContainer: "text-[#f0f0f8]",
      userPreviewMainIdentifier: "text-white font-semibold",
      userPreviewSecondaryIdentifier: "text-[#9CA3AF]",
      modalContent: "border border-white/8",
      card: "shadow-none",
      navbar: "border-r border-white/8",
      navbarButton: "text-[#B2B5E0] hover:bg-white/5 hover:text-white",
      pageScrollBox: "bg-transparent",
      pageHeader: "border-b border-white/8",
      profileSection: "border-b border-white/8",
      profileSectionTitle: "text-[#9CA3AF]",
      formFieldInput: "border-white/15",
      formButtonPrimary: "hover:opacity-90",
      dividerLine: "bg-white/8",
      footer: "border-t border-white/8",
      tableCell: "border-b border-white/8",
    },
  };
}

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { convexUser, clerkUser, isLoading } = useCurrentUser();
  const { theme } = useTheme();
  const clerkAppearance = getClerkAppearance(theme);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!convexUser && !isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg">Error loading user. Please sign in again.</p>
        <p className="text-sm text-muted-foreground">
          Clerk User: {clerkUser?.fullName || clerkUser?.emailAddresses[0]?.emailAddress || "Not found"}
        </p>
        <button
          onClick={() => window.location.href = "/sign-in"}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Sign In Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary-foreground">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">Chatly</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-400" />
            <span className="text-sm font-medium">{convexUser?.name}</span>
          </div>
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={clerkAppearance}
            userProfileProps={{ appearance: clerkAppearance }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
