"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "cs";

interface Translations {
  [key: string]: {
    en: string;
    cs: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.backToLists": { en: "← Back to lists", cs: "← Zpět na seznamy" },
  "nav.shoppingLists": { en: "Shopping lists", cs: "Nákupní seznamy" },

  // Overview page
  "overview.title": { en: "Shopping lists", cs: "Nákupní seznamy" },
  "overview.description": {
    en: "Overview of all shopping lists. Click a tile to open its detail.",
    cs: "Přehled všech nákupních seznamů. Klikněte na dlaždici pro otevření detailu.",
  },
  "overview.newList": { en: "+ New list", cs: "+ Nový seznam" },
  "overview.filterAll": { en: "All", cs: "Vše" },
  "overview.filterActive": { en: "Active", cs: "Aktivní" },
  "overview.filterArchived": { en: "Archived", cs: "Archivované" },
  "overview.noLists": {
    en: 'No shopping lists for this filter. Use "+ New list" to create one.',
    cs: 'Žádné nákupní seznamy pro tento filtr. Použijte "+ Nový seznam" pro vytvoření.',
  },
  "overview.loading": { en: "Loading…", cs: "Načítání…" },
  "overview.itemsPerList": { en: "Items per List", cs: "Položky na seznam" },
  "overview.itemsCount": { en: "Items", cs: "Položky" },

  // Detail page
  "detail.listId": { en: "List ID", cs: "ID seznamu" },
  "detail.owner": { en: "Owner", cs: "Vlastník" },
  "detail.editName": { en: "Edit name", cs: "Upravit název" },
  "detail.archive": { en: "Archive", cs: "Archivovat" },
  "detail.unarchive": { en: "Unarchive", cs: "Zrušit archivaci" },
  "detail.archiving": { en: "Archiving…", cs: "Archivování…" },
  "detail.unarchiving": { en: "Unarchiving…", cs: "Zrušování archivace…" },
  "detail.saving": { en: "Saving…", cs: "Ukládání…" },
  "detail.save": { en: "Save", cs: "Uložit" },
  "detail.cancel": { en: "Cancel", cs: "Zrušit" },
  "detail.nameRequired": { en: "Name is required.", cs: "Název je povinný." },

  // Items section
  "items.title": { en: "Items", cs: "Položky" },
  "items.filter": { en: "Filter", cs: "Filtr" },
  "items.filterAll": { en: "All", cs: "Vše" },
  "items.filterOpen": { en: "To buy", cs: "K nákupu" },
  "items.filterDone": { en: "Completed", cs: "Dokončené" },
  "items.quantity": { en: "Quantity", cs: "Množství" },
  "items.productName": { en: "Product name", cs: "Název produktu" },
  "items.resolved": { en: "Resolved", cs: "Vyřešeno" },
  "items.noItems": { en: "No items yet.", cs: "Zatím žádné položky." },
  "items.selected": { en: "selected", cs: "vybráno" },
  "items.editItem": { en: "Edit item", cs: "Upravit položku" },
  "items.markCompleted": { en: "Mark as completed", cs: "Označit jako dokončené" },
  "items.markUndone": { en: "Mark as undone", cs: "Označit jako nedokončené" },
  "items.delete": { en: "Delete", cs: "Smazat" },
  "items.unselectAll": { en: "Unselect all", cs: "Zrušit výběr" },
  "items.done": { en: "Done", cs: "Hotovo" },
  "items.pending": { en: "Pending", cs: "Čekající" },
  "items.addItem": { en: "Add item", cs: "Přidat položku" },
  "items.adding": { en: "Adding…", cs: "Přidávání…" },
  "items.productNamePlaceholder": { en: "Product name…", cs: "Název produktu…" },
  "items.editItemTitle": { en: "Edit item", cs: "Upravit položku" },
  "items.deleteConfirm": { en: "Delete {count} item(s)?", cs: "Smazat {count} položku/položky?" },

  // Statistics
  "stats.itemsStatus": { en: "Items Status", cs: "Stav položek" },
  "stats.resolved": { en: "Resolved", cs: "Vyřešené" },
  "stats.unresolved": { en: "Unresolved", cs: "Nevyřešené" },

  // Members section
  "members.title": { en: "Members", cs: "Členové" },
  "members.members": { en: "Members", cs: "Členové" },

  // Create modal
  "create.title": { en: "New shopping list", cs: "Nový nákupní seznam" },
  "create.name": { en: "Name", cs: "Název" },
  "create.create": { en: "Create", cs: "Vytvořit" },
  "create.creating": { en: "Creating…", cs: "Vytváření…" },
  "create.nameRequired": { en: "Name is required.", cs: "Název je povinný." },

  // Common
  "common.loading": { en: "Loading…", cs: "Načítání…" },
  "common.error": { en: "Error", cs: "Chyba" },
  "common.notFound": { en: "List not found.", cs: "Seznam nenalezen." },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "language";
const DEFAULT_LANGUAGE: Language = "en";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // IMPORTANT: SSR + first client render must match -> always start with DEFAULT_LANGUAGE
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  // Load from localStorage only AFTER mount (prevents hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "cs") {
      setLanguageState(saved);
      return;
    }

    // Optional: set default by browser language, but only after mount
    const browser = (navigator.language || "").toLowerCase();
    if (browser.startsWith("cs")) setLanguageState("cs");
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const translation = translations[key]?.[language] ?? key;
      if (!params) return translation;

      return translation.replace(/\{(\w+)\}/g, (_, paramKey: string) => {
        const v = params[paramKey];
        return v === undefined || v === null ? `{${paramKey}}` : String(v);
      });
    };
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}