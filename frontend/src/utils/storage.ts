import {
  DEFAULT_EMERGENCY_CONTACT,
  DEFAULT_SHARE_CODE,
  INITIAL_VERIFIED_MEDICINES,
  INITIAL_VITALS,
} from "../config";
import {
  EmergencyContact,
  LanguageCode,
  ThemeMode,
  VerifiedMedicine,
  VitalLogEntry,
} from "../types/api";

const KEYS = {
  VERIFIED_MEDS: "nanicare_verified_medicines_v2",
  VITALS: "nanicare_vitals_v2",
  EMERGENCY: "nanicare_emergency_contact_v2",
  SHARE_CODE: "nanicare_share_code_v2",
  THEME: "nanicare_theme_v1",
  LANGUAGE: "nanicare_language_v1",
} as const;

const MEMORY_ONLY_KEYS = new Set<string>([KEYS.VERIFIED_MEDS, KEYS.VITALS]);
const memoryOnlyValues = new Map<string, unknown>();

function safeRead<T>(key: string, fallback: T): T {
  if (MEMORY_ONLY_KEYS.has(key)) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore unavailable browser storage
    }
    return (memoryOnlyValues.has(key) ? memoryOnlyValues.get(key) : fallback) as T;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (MEMORY_ONLY_KEYS.has(key)) {
    memoryOnlyValues.set(key, value);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore unavailable browser storage
    }
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues cleanly
  }
}

export function loadShareCode(): string {
  const code = safeRead<string | null>(KEYS.SHARE_CODE, null);
  return code && code.trim() ? code.trim().toUpperCase() : DEFAULT_SHARE_CODE;
}

export function saveShareCode(code: string): void {
  safeWrite(KEYS.SHARE_CODE, (code || DEFAULT_SHARE_CODE).trim().toUpperCase());
}

export function loadVerifiedMedicines(shareCode: string = DEFAULT_SHARE_CODE): VerifiedMedicine[] {
  const stored = safeRead<VerifiedMedicine[] | null>(KEYS.VERIFIED_MEDS, null);
  const normalized = shareCode.trim().toUpperCase();
  if (!stored) {
    safeWrite(KEYS.VERIFIED_MEDS, INITIAL_VERIFIED_MEDICINES);
    return INITIAL_VERIFIED_MEDICINES.filter(
      (item) => item.caregiver_verified === true && item.share_code === normalized
    );
  }
  return stored.filter(
    (item) => item.caregiver_verified === true && item.share_code === normalized
  );
}

export function loadAllStoredMedicines(): VerifiedMedicine[] {
  const stored = safeRead<VerifiedMedicine[] | null>(KEYS.VERIFIED_MEDS, null);
  if (!stored) {
    safeWrite(KEYS.VERIFIED_MEDS, INITIAL_VERIFIED_MEDICINES);
    return INITIAL_VERIFIED_MEDICINES;
  }
  return stored.filter((item) => item.caregiver_verified === true);
}

export function saveAllStoredMedicines(medicines: VerifiedMedicine[]): void {
  const verifiedOnly = medicines.filter((item) => item.caregiver_verified === true);
  safeWrite(KEYS.VERIFIED_MEDS, verifiedOnly);
}

export function loadVitals(shareCode: string = DEFAULT_SHARE_CODE): VitalLogEntry[] {
  const stored = safeRead<VitalLogEntry[] | null>(KEYS.VITALS, null);
  const normalized = shareCode.trim().toUpperCase();
  if (!stored) {
    safeWrite(KEYS.VITALS, INITIAL_VITALS);
    return INITIAL_VITALS.filter((v) => v.share_code === normalized);
  }
  return stored.filter((v) => v.share_code === normalized);
}

export function loadAllStoredVitals(): VitalLogEntry[] {
  const stored = safeRead<VitalLogEntry[] | null>(KEYS.VITALS, null);
  if (!stored) {
    safeWrite(KEYS.VITALS, INITIAL_VITALS);
    return INITIAL_VITALS;
  }
  return stored;
}

export function saveAllStoredVitals(vitals: VitalLogEntry[]): void {
  safeWrite(KEYS.VITALS, vitals);
}

export function loadEmergencyContact(): EmergencyContact {
  try {
    window.localStorage.removeItem(KEYS.EMERGENCY);
  } catch {
    // Ignore unavailable browser storage
  }
  return DEFAULT_EMERGENCY_CONTACT;
}

export function saveEmergencyContact(_contact: EmergencyContact): void {
  try {
    window.localStorage.removeItem(KEYS.EMERGENCY);
  } catch {
    // Ignore unavailable browser storage
  }
}

export function loadTheme(): ThemeMode {
  const stored = safeRead<ThemeMode | null>(KEYS.THEME, null);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

export function saveTheme(theme: ThemeMode): void {
  safeWrite(KEYS.THEME, theme);
}

export function loadLanguage(): LanguageCode {
  const stored = safeRead<LanguageCode | null>(KEYS.LANGUAGE, null);
  if (stored === "en" || stored === "hi" || stored === "mr") return stored;
  return "en";
}

export function saveLanguage(language: LanguageCode): void {
  safeWrite(KEYS.LANGUAGE, language);
}
