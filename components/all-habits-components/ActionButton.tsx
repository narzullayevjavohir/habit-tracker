import Link from "next/link";
import { Button } from "../ui/button";

interface HabitActionButtonProps {
  habitId: string;
  variant?: "view" | "edit" | "delete";
}

export const HabitActionButton = ({
  habitId,
  variant = "view",
}: HabitActionButtonProps) => {
  const config = {
    view: {
      href: `/habits/${habitId}`,
      className: "hover:bg-gray-400 hover:text-white",
      label: "View",
    },
    edit: {
      href: `/habits/${habitId}/edit`,
      className: "hover:bg-yellow-400 hover:text-white",
      label: "Edit",
    },
    delete: {
      href: `/habits/${habitId}/delete`,
      className: "hover:bg-red-400 hover:text-white",
      label: "Delete",
    },
  };

  const { href, className, label } = config[variant];

  return (
    <Button asChild variant="ghost" size="sm" className={`flex-1 ${className}`}>
      <Link href={href}>{label}</Link>
    </Button>
  );
};
