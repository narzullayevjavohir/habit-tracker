"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: false,
});

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    // Handle route change completion
    handleStop();

    // Add event listeners for manual route changes
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => {
      link.addEventListener("click", handleStart);
    });

    return () => {
      // Clean up listeners
      links.forEach((link) => {
        link.removeEventListener("click", handleStart);
      });
      NProgress.remove();
    };
  }, [pathname, searchParams]);

  return null;
}
