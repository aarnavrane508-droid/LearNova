import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Locally owned shadcn/ui Base UI button, styled for Coolearn.
export const buttonVariants=cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-background text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
      },
      size: { default: "h-11 px-6", sm: "h-9 px-4 text-xs", lg: "h-13 px-7" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({ className, variant, size, ...props }: ButtonPrimitive.Props&VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
