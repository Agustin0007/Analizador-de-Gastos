export const translations = {
  es: {
    categories: 'Categorías',
    expenses: 'Gastos',
    income: 'Ingresos',
    settings: 'Configuración',
    // Añade más traducciones según necesites
  },
  en: {
    categories: 'Categories',
    expenses: 'Expenses',
    income: 'Income',
    settings: 'Settings',
    // Añade más traducciones según necesites
  }
};

export function useTranslation() {
  const { config } = useConfig();
  const t = (key) => translations[config.general.language]?.[key] || key;
  return { t };
}