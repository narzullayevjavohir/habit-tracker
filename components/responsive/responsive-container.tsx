"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({
  children,
  className = "",
}: ResponsiveContainerProps) {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getContainerClasses = () => {
    const baseClasses = "w-full mx-auto px-4";

    switch (screenSize) {
      case "mobile":
        return `${baseClasses} max-w-sm`;
      case "tablet":
        return `${baseClasses} max-w-4xl`;
      case "desktop":
        return `${baseClasses} max-w-7xl`;
      default:
        return baseClasses;
    }
  };

  return (
    <motion.div
      className={`${getContainerClasses()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveGrid({
  children,
  className = "",
  cols = { mobile: 1, tablet: 2, desktop: 3 },
}: ResponsiveGridProps) {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getGridCols = () => {
    switch (screenSize) {
      case "mobile":
        return `grid-cols-${cols.mobile || 1}`;
      case "tablet":
        return `grid-cols-${cols.tablet || 2}`;
      case "desktop":
        return `grid-cols-${cols.desktop || 3}`;
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div className={`grid gap-6 ${getGridCols()} ${className}`}>{children}</div>
  );
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function ResponsiveText({
  children,
  className = "",
  sizes = { mobile: "text-lg", tablet: "text-xl", desktop: "text-2xl" },
}: ResponsiveTextProps) {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTextSize = () => {
    switch (screenSize) {
      case "mobile":
        return sizes.mobile || "text-lg";
      case "tablet":
        return sizes.tablet || "text-xl";
      case "desktop":
        return sizes.desktop || "text-2xl";
      default:
        return "text-lg";
    }
  };

  return <span className={`${getTextSize()} ${className}`}>{children}</span>;
}





