import { SignIn } from "@clerk/nextjs";

const clerkDarkAppearance = {
  variables: {
    colorBackground: "#181C3A",
    colorInputBackground: "#0d1020",
    colorPrimary: "#0FFCBE",
    colorPrimaryForeground: "#0F1226",
    colorText: "#f0f0f8",
    colorTextSecondary: "#9CA3AF",
    colorInputText: "#f0f0f8",
    colorNeutral: "#B2B5E0",
    colorDanger: "#f87171",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  elements: {
    card: "shadow-2xl shadow-black/60 border border-white/8",
    headerTitle: "text-white",
    headerSubtitle: "text-[#9CA3AF]",
    socialButtonsBlockButton: "border border-white/10 bg-white/5 hover:bg-white/10 text-white",
    dividerLine: "bg-white/10",
    dividerText: "text-[#9CA3AF]",
    formFieldLabel: "text-[#B2B5E0] font-medium",
    formFieldInput: "bg-[#0d1020] border-white/10 text-white placeholder:text-white/30 focus:border-[#0FFCBE]/50",
    formButtonPrimary:
      "bg-[#0FFCBE] hover:bg-[#0FFCBE]/90 text-[#0F1226] font-bold shadow-lg shadow-[#0FFCBE]/20",
    footerAction: "text-[#9CA3AF]",
    footerActionLink: "text-[#0FFCBE] hover:text-[#0FFCBE]/80 font-semibold",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-[#0FFCBE]",
    badge: "hidden",
  },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lbg">
      <SignIn
        afterSignInUrl="/chats"
        fallbackRedirectUrl="/chats"
        appearance={clerkDarkAppearance}
      />
    </div>
  );
}
