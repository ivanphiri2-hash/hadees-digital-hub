import { COMPANY } from "@/lib/company";

export function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hi Hadees Trading, I'd like to enquire about your services.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/40 ring-4 ring-[#25D366]/15 transition-transform hover:-translate-y-0.5"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M19.11 17.27c-.28-.14-1.66-.82-1.92-.91-.26-.1-.45-.14-.63.14-.19.28-.72.9-.89 1.09-.16.19-.32.2-.6.07-.28-.14-1.19-.44-2.27-1.4-.84-.75-1.4-1.67-1.57-1.95-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.33s1 2.71 1.14 2.9c.14.19 1.97 3 4.77 4.21.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.89-1.33.23-.65.23-1.21.16-1.33-.07-.12-.26-.19-.54-.33zM16.02 5.33C10.13 5.33 5.34 10.12 5.34 16c0 1.87.49 3.7 1.42 5.31L5.33 26.67l5.5-1.42c1.56.85 3.32 1.3 5.11 1.3h.01c5.89 0 10.68-4.79 10.68-10.68 0-2.85-1.11-5.53-3.13-7.55a10.65 10.65 0 0 0-7.56-3.13z"/>
      </svg>
    </a>
  );
}
