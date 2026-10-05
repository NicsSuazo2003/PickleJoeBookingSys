// src/utils/amenityIcons.ts
import {
  Wifi,
  Car,
  Coffee,
  Armchair,
  Layers,
  Sparkles,
  Droplets,
  ShowerHead,
  Warehouse,
  Wind,
  Users,
  ShoppingBag,
  Utensils,
  Bath,
  Sun,
  Moon,
  Zap,
  Lock,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps amenity names (case-insensitive) to lucide-react icon components.
 * Anything not found falls back to Sparkles.
 *
 * To add a new amenity icon: add a key here matching the amenity name
 * (lowercase), and set the value to the lucide icon component.
 */
const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  // Connectivity
  wifi: Wifi,
  internet: Wifi,
  'piso wi-fi': Wifi,
  'piso wifi': Wifi,

  // Parking & transport
  parking: Car,
  'free parking': Car,
  'own parking': Car,

  // Food & drinks
  cafe: Coffee,
  'in-house cafe': Coffee,
  'in-house cafe & cr': Coffee,
  refreshments: Coffee,
  drinks: Coffee,
  food: Utensils,

  // Seating & comfort
  'waiting area': Armchair,
  'shaded waiting area': Armchair,
  'spectator seating': Armchair,
  seating: Armchair,
  benches: Armchair,

  // Court type
  indoor: Warehouse,
  outdoor: Sun,
  'silica sand court': Layers,
  'silica sand finish': Layers,
  'premium court': Sparkles,
  'table tennis': Sparkles,

  // Climate
  'air conditioned': Wind,
  'air conditioning': Wind,
  ac: Wind,
  fan: Wind,

  // Water & hygiene
  showers: ShowerHead,
  shower: ShowerHead,
  'water station': Droplets,
  drinking: Droplets,
  restroom: Bath,
  cr: Bath,
  'comfort room': Bath,

  // Lighting
  lighted: Zap,
  lighting: Zap,
  'well-lit': Zap,
  'night play': Moon,

  // Retail & rental
  'pro shop': ShoppingBag,
  shop: ShoppingBag,
  'paddle rental': Sparkles,
  rental: Sparkles,
  'paddle club': Users,

  // Security
  lockers: Lock,
  locker: Lock,
  security: ShieldCheck,
  cctv: ShieldCheck,

  // Group features
  'open play': Users,
  'group play': Users,
};

/**
 * Get the lucide icon component for an amenity name.
 * Case-insensitive. Trims whitespace. Falls back to Sparkles.
 */
export function getAmenityIcon(name: string): LucideIcon {
  const key = name.trim().toLowerCase();
  return AMENITY_ICON_MAP[key] ?? Sparkles;
}