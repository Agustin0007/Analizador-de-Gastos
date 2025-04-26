import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ConfigContext = createContext();

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({ children }) {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    general: {
      currency: 'USD',
      language: 'es',
      timezone: 'America/Asuncion',
      analysisFrequency: 'weekly',
      theme: 'light'
    },
    categories: [],
    visualization: {
      defaultChart: 'pie',
      comparePeriods: true,
      thresholds: {}
    },
    budgets: {},
    alerts: []
  });

  useEffect(() => {
    if (user) {
      loadUserConfig();
    }
  }, [user]);

  const loadUserConfig = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'userConfigs', user.uid));
      if (configDoc.exists()) {
        setConfig(configDoc.data());
      } else {
        // Save default config if none exists
        await saveConfig(config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const saveConfig = async (newConfig) => {
    try {
      await setDoc(doc(db, 'userConfigs', user.uid), newConfig);
      setConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  };

  return (
    <ConfigContext.Provider value={{ config, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}