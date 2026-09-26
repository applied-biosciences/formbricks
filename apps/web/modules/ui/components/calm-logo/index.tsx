import Image from "next/image";
import { CALM_BRAND } from "@/lib/branding/calm";
import { cn } from "@/lib/cn";

interface CalmLogoProps {
  className?: string;
  /** Use the compact circular CALM mark where the full vertical logo will not fit. */
  compact?: boolean;
  priority?: boolean;
}

export const CalmLogo = ({ className, compact = false, priority = false }: Readonly<CalmLogoProps>) => {
  const src = compact ? CALM_BRAND.iconPath : CALM_BRAND.logoPath;

  return (
    <Image
      src={src}
      alt={compact ? `${CALM_BRAND.productFamily} mark` : CALM_BRAND.productDescription}
      width={compact ? 512 : 1122}
      height={compact ? 512 : 1402}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
};
