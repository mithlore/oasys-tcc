// Junta classes CSS do Tailwind sem duplicar/conflitar (usado pelos componentes).
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas));
}
