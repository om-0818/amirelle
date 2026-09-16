import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const choiceVariants = cva("rounded-xl border text-left transition-colors duration-150 ease-out", {
  variants: {
    size: {
      card: "min-h-16 px-3 py-2",
      chip: "min-h-11 rounded-full px-4 text-sm",
      row: "min-h-11 w-full px-4 text-sm",
    },
    on: {
      true: "",
      false: "border-border text-muted",
    },
    ink: {
      false: "",
      true: "",
    },
  },
  compoundVariants: [
    {
      on: true,
      ink: false,
      class: "border-accent bg-card shadow-[0_0_0_1px_var(--color-accent)]",
    },
    {
      on: true,
      ink: true,
      class: "border-fg bg-fg text-bg",
    },
  ],
  defaultVariants: { size: "card", on: false, ink: false },
});

export function Choice({
  className,
  size,
  on,
  ink,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof choiceVariants>) {
  return (
    <button
      type="button"
      className={cn(choiceVariants({ size, on, ink }), className)}
      {...props}
    />
  );
}

export function ChoiceLabel({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("font-display text-xl italic text-fg", className)} {...props} />;
}
