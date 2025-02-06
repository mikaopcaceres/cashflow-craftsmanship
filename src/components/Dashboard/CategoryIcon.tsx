import { 
  Wallet, 
  Building2, 
  Car, 
  ShoppingCart, 
  HeartPulse, 
  GraduationCap, 
  Utensils, 
  DollarSign,
  Briefcase,
  PiggyBank,
  Gamepad2,
  LucideIcon,
} from "lucide-react";

type CategoryIconProps = {
  category: string;
  className?: string;
};

export const CategoryIcon = ({ category, className }: CategoryIconProps) => {
  const getIcon = (): LucideIcon => {
    switch (category.toLowerCase()) {
      case 'salary':
        return Briefcase;
      case 'investment':
        return PiggyBank;
      case 'food':
        return Utensils;
      case 'transport':
        return Car;
      case 'housing':
        return Building2;
      case 'leisure':
        return Gamepad2;
      case 'health':
        return HeartPulse;
      case 'education':
        return GraduationCap;
      default:
        return Wallet;
    }
  };

  const Icon = getIcon();
  return <Icon className={className} />;
};