"use client";

import { ALargeSmall } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore, type FontSize } from "@/stores/settings";

const SIZE_LABELS: Record<FontSize, string> = {
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
};

export function FontSizeControl() {
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Font size"
        className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ALargeSmall className="size-4.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuRadioGroup
          value={fontSize}
          onValueChange={(v) => setFontSize(v as FontSize)}
        >
          {(Object.keys(SIZE_LABELS) as FontSize[]).map((size) => (
            <DropdownMenuRadioItem key={size} value={size}>
              {SIZE_LABELS[size]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
