import {
  Briefcase,
  Crown,
  DollarSign,
  Wallet,
  Heart,
  Users,
  Baby,
  Flame,
  AlertTriangle,
  MessageCircle,
  Megaphone,
  Shield,
} from 'lucide-react';

// Maps taxonomy category IDs to Lucide icons
export const CATEGORY_ICONS: Record<string, typeof Briefcase> = {
  career: Briefcase,
  leadership: Crown,
  business: DollarSign,
  finance: Wallet,
  dating: Heart,
  relationships: Users,
  parenting: Baby,
  personal_power: Flame,
  high_stakes: AlertTriangle,
  texting: MessageCircle,
  influence: Megaphone,
  defense: Shield,
};

export function getCategoryIcon(categoryId: string) {
  return CATEGORY_ICONS[categoryId] || Briefcase;
}
