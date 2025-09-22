// app/components/TopProgressBar.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure nprogress
NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: false,
});

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Complete progress when route changes
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Handle click events on links
    const handleClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute("href");

      if (href && href.startsWith("/") && href !== pathname) {
        NProgress.start();
      }
    };

    // Add click listeners to all links
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => {
      link.addEventListener("click", handleClick as EventListener);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleClick as EventListener);
      });
    };
  }, [pathname]);

  return null;
}
