"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", icon: "dashboard", label: "Home" },
  { href: "/courses", icon: "library_books", label: "Courses" },
  { href: "/practice", icon: "quiz", label: "Practice" },
  { href: "/assistant", icon: "smart_toy", label: "AI" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-6 bg-surface/70 backdrop-blur-xl border-t border-white/50 shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[28px]">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center rounded-full px-3 py-1 transition-all duration-200 ${
              active
                ? "text-primary bg-secondary-container/30"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label-md text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
