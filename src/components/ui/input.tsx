import * as React from "react";

import { cn } from "@/lib/utils";

// Define additional props for the Input component, including a 'size' prop.
// This allows for different visual sizes of the input field, which can be useful
// for various contexts such as a prominent search bar (large) or compact filter inputs (small).
export interface InputProps extends React.ComponentProps<"input"> {
  /**
   * Defines the visual size of the input field.
   * 'default' maintains the existing size.
   * 'sm' provides a smaller input, suitable for compact forms or filters.
   * 'lg' provides a larger input, ideal for prominent search fields or primary actions.
   */
  size?: "default" | "sm" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size = "default", ...props }, ref) => {
    // Define Tailwind CSS classes for different input sizes.
    // The 'default' size maintains the original styling for consistency.
    const sizeClasses = {
      default: "h-10 px-3 py-2 text-base md:text-sm", // Original default size, including responsive text size
      sm: "h-9 px-2 py-1 text-sm", // Smaller height, padding, and font size for compact inputs
      lg: "h-12 px-4 py-2 text-lg", // Larger height, padding, and font size for prominent inputs
    };

    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size], // Apply size-specific classes based on the 'size' prop
          className, // Allow custom classes to override or extend the default styling
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };