import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

// Define the available sizes for the checkbox component.
type CheckboxSize = "sm" | "md" | "lg";

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /**
   * Defines the size of the checkbox. This is particularly useful for adapting the checkbox
   * to different UI densities, such as in compact filter lists where smaller checkboxes
   * might be preferred to save space, or larger ones for increased prominence.
   * @default "md"
   */
  size?: CheckboxSize;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "md", ...props }, ref) => {
  // Determine the base classes for the checkbox root element based on the 'size' prop.
  // This allows for flexible sizing to fit various UI contexts, including filter sidebars.
  const sizeClasses = {
    sm: "h-3 w-3", // Smaller size, ideal for compact layouts like filter options in a sidebar.
    md: "h-4 w-4", // Default size, suitable for most general use cases.
    lg: "h-5 w-5", // Larger size, for increased visibility or touch targets.
  };

  // Determine the icon size classes to ensure the checkmark icon scales proportionally
  // with the checkbox root element.
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size], // Apply the selected size classes to the checkbox root.
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        {/* Apply the corresponding icon size classes to the Check icon. */}
        <Check className={cn(iconSizeClasses[size])} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };