import {
  Stethoscope,
  Bluetooth as Tooth,
  HeartPulse,
  Wrench,
  Building2,
  GraduationCap,
  Clock,
  type LucideIcon,
} from "lucide-react";

export type Specialty = {
  id: string;
  label: string;
};

export type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  specialties?: Specialty[];
};

/**
 * Single source of truth for categories + specialties.
 * Add a new entry here to surface a new category across the app.
 */
export const CATEGORIES: Category[] = [
  {
    id: "doctors",
    label: "Doctors",
    icon: Stethoscope,
    description: "Consultants, residents, fellows",
    specialties: [
      { id: "general-physician", label: "General Physician" },
      { id: "radiology", label: "Radiology" },
      { id: "cardiology", label: "Cardiology" },
      { id: "orthopedics", label: "Orthopedics" },
      { id: "pediatrics", label: "Pediatrics" },
      { id: "neurology", label: "Neurology" },
    ],
  },
  {
    id: "dentists",
    label: "Dentists",
    icon: Tooth,
    description: "Surgeons & specialists",
    specialties: [
      { id: "dental-surgeon", label: "Dental Surgeon" },
      { id: "endodontics", label: "Endodontics" },
      { id: "orthodontics", label: "Orthodontics" },
      { id: "prosthodontics", label: "Prosthodontics" },
    ],
  },
  {
    id: "nurses",
    label: "Nurses",
    icon: HeartPulse,
    description: "ICU, OT, ward & home care",
  },
  {
    id: "technicians",
    label: "Technicians",
    icon: Wrench,
    description: "Lab, radiology, OT tech",
  },
  {
    id: "admin",
    label: "Admin / Hospital Ops",
    icon: Building2,
    description: "Operations, billing, HR",
  },
  {
    id: "internships",
    label: "Internships / Observership",
    icon: GraduationCap,
    description: "Early-career programs",
  },
  {
    id: "locum",
    label: "Locum / Temporary",
    icon: Clock,
    description: "Short-term & on-call shifts",
  },
];

export const ROLE_TYPES = ["Doctor", "Dentist", "Nurse", "Technician", "Admin"] as const;
export type RoleType = (typeof ROLE_TYPES)[number];
