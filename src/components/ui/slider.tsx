import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Ensure the 'value' prop is always an array, defaulting to [0] if not provided.
  // Radix UI's SliderPrimitive.Root expects 'value' to be an array of numbers,
  // even for a single-point slider. This makes the component robust for both
  // single-point and range sliders, which is essential for features like
  // price range filtering where a slider might represent a single value or a range.
  const value = props.value || props.defaultValue || [0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      // Pass the determined 'value' array to the Radix Slider.
      value={value}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {/*
        Dynamically render SliderPrimitive.Thumb components based on the length of the 'value' array.
        This ensures the correct number of thumbs are rendered for both single-point sliders
        (e.g., value=[50]) and range sliders (e.g., value=[20, 80]).
        This approach is more robust and flexible than conditional rendering for a fixed number of thumbs,
        as it naturally adapts to the number of values provided. This is crucial for implementing
        features like price range filtering, where the slider needs to represent a minimum and
        maximum value with two draggable points, or a single point if only one value is relevant.
      */}
      {value.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index} // Radix UI requires a unique key for each thumb
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };