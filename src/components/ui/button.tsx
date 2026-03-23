import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
      primary:
        "bg-espresso-900 text-cream-50 border-2 border-espresso-900 hover:bg-espresso-800 hover:border-espresso-800",
      secondary:
        "bg-transparent text-espresso-900 border-2 border-espresso-900 hover:bg-espresso-900 hover:text-cream-50",
      ghost:
        "bg-transparent text-espresso-700 hover:text-espresso-900 hover:bg-cream-200",
      danger:
        "bg-rust-600 text-cream-50 border-2 border-rust-600 hover:bg-rust-700 hover:border-rust-700",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
