import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      {children}
      <Toaster position="bottom-right" richColors closeButton theme="dark" />
    </TooltipProvider>
  );
}
