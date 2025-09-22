// components/navigation-bar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/all-habits", label: "All Habits", icon: "📊" },
    { href: "/regular-habits", label: "Regular Habits", icon: "🔄" },
    { href: "/new-habits", label: "New Habits", icon: "✨" },
    { href: "/methods", label: "Methods", icon: "📚" },
    { href: "/contact", label: "Contact", icon: "📞" },
  ];

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <span className="font-bold text-lg">HabitTracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={isActive(item.href) ? "secondary" : "ghost"}
              asChild
              className={cn(
                "text-sm font-medium transition-colors hover:bg-muted/50",
                isActive(item.href) ? "bg-muted" : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link
                  href="/"
                  className="flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                  <span className="font-bold text-lg">HabitTracker</span>
                </Link>
              </div>
              <div className="mt-5 h-full pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center py-2 text-lg font-medium transition-colors",
                        isActive(item.href)
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;
