"use client";

import { useState } from "react";

const iconBaseUrl = "https://d1tie8g2r03vuj.cloudfront.net/user-icon";
const fallbackIcon = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/memberIcons/member-alice.svg`;

export function MemberIcon({
  id,
  name,
  className,
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const [hasFailed, setHasFailed] = useState(false);
  const src = hasFailed
    ? fallbackIcon
    : `${iconBaseUrl}/${encodeURIComponent(id)}_icon.png`;

  return (
    <img
      className={className}
      src={src}
      alt={`${name}のアイコン`}
      onError={() => {
        if (!hasFailed) setHasFailed(true);
      }}
    />
  );
}
