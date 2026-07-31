import { Facebook, Instagram, Linkedin, Youtube, Send, MessageCircle } from "lucide-react";
import type { ComponentType } from "react";

import { SOCIALS, type SocialKey } from "@/lib/company";

function XIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={props.className} fill="currentColor">
      <path d="M18.9 2H22l-7.1 8.1L23.3 22h-6.6l-5.2-6.8L5.6 22H2.5l7.6-8.7L1 2h6.8l4.7 6.2L18.9 2Zm-1.1 18h1.8L7.3 3.9H5.4L17.8 20Z" />
    </svg>
  );
}
function TiktokIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={props.className} fill="currentColor">
      <path d="M16.5 3c.4 2.1 1.7 3.5 3.9 3.7v2.6c-1.4.1-2.7-.3-3.9-1v5.9c0 4-3.3 6.6-6.8 5.6-2.6-.7-4.3-3.2-4.1-5.9.2-2.9 2.7-5.1 5.6-5v2.8c-.4-.1-.8-.1-1.2 0-1.3.2-2.2 1.4-2 2.7.2 1.3 1.4 2.2 2.7 2 1.2-.2 2-1.2 2-2.4V3h3.8Z" />
    </svg>
  );
}
function DiscordIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={props.className} fill="currentColor">
      <path d="M19.3 5.3A16 16 0 0 0 15.5 4l-.3.5c1.3.3 2.4.8 3.4 1.5a12 12 0 0 0-10.2 0c1-.7 2.1-1.2 3.4-1.5L11.5 4c-1.3.2-2.6.6-3.8 1.3C5.3 8.9 4.6 12.4 5 15.9A16 16 0 0 0 9.7 18l.9-1.3c-.8-.3-1.5-.7-2.2-1.2l.5-.4a11 11 0 0 0 9.3 0l.5.4c-.7.5-1.4.9-2.2 1.2l.9 1.3a16 16 0 0 0 4.7-2.1c.5-4-.6-7.5-2.8-10.6ZM9.7 14c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Zm4.6 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Z" />
    </svg>
  );
}

const ICONS: Record<SocialKey, ComponentType<{ className?: string }>> = {
  whatsapp: MessageCircle,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  x: XIcon,
  youtube: Youtube,
  tiktok: TiktokIcon,
  telegram: Send,
  discord: DiscordIcon,
};

export function SocialLinks({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {SOCIALS.map((s) => {
        const Icon = ICONS[s.key];
        return (
          <li key={s.key}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className={`inline-flex ${box} items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground transition-colors hover:border-[var(--color-gold)]/50 hover:text-foreground`}
            >
              <Icon className={icon} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
