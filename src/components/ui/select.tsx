import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "w-full px-4 py-3 bg-cream-100 text-espresso-900",
            "border-2 border-cream-300 transition-colors duration-200",
            "hover:border-cream-400",
            "focus:border-espresso-500 focus:bg-cream-50 focus:outline-none",
            "appearance-none cursor-pointer pr-10",
            error && "border-rust-500 focus:border-rust-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-500 pointer-events-none" />
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
