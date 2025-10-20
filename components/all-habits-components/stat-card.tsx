import { Card, CardContent } from "../ui/card";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  iconColor?: string;
}

export const StatCard = ({
  icon: Icon,
  value,
  label,
  iconColor = "text-blue-500",
}: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-center">
        <Icon className={`w-8 h-8 ${iconColor} mr-3`} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
