import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variants = {
  default: "bg-cream-200 text-espresso-700",
  success: "bg-sage-100 text-sage-700",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-rust-100 text-rust-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5",
        "text-xs font-medium uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
