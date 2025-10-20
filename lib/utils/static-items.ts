interface NavItem {
  href: string;
  label: string;
  icon: string;
}
export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/all-habits", label: "All Habits", icon: "🎖️" },
  { href: "/ratings", label: "Ratings", icon: "🏆" },
  { href: "/new-habits", label: "Create Habits", icon: "✨" },
  { href: "/events", label: "Events", icon: "❄️" },
  { href: "/habit-shop", label: "Shop", icon: "🛒" },
  { href: "/contact", label: "Contact", icon: "📞" },
];
