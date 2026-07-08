"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Reusable, decorative portrait that reads from `public/portrait.png`.
 * Hides itself if the asset is missing so layouts never show a broken image.
 * Positioning/sizing is supplied by the caller via `className` (must be a
 * positioned, sized box — the image fills it).
 */
export function PortraitImage({
  className,
  imgClassName = "object-contain object-bottom",
  sizes,
  priority = false,
  alt = "Portrait of Amandi De Silva",
}: {
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  alt?: string;
}) {
  const [available, setAvailable] = useState(true);
  if (!available) return null;

  return (
    <div aria-hidden className={className}>
      <Image
        src="/portrait.png"
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={imgClassName}
        onError={() => setAvailable(false)}
      />
    </div>
  );
}
