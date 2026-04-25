import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const EnvironmentContext = createContext(null);

const STORAGE_KEY = 'activeEnvironmentId';

export function EnvironmentProvider({ children }) {
  const { user } = useAuth();
  const [environments, setEnvironments] = useState([]);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setEnvironments([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api('/api/environments');
      const list = data.environments || [];
      setEnvironments(list);
      const active = list.find((e) => e.isActive);
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedOk = stored && list.some((e) => String(e._id) === String(stored));
      if (active) {
        setActiveId(String(active._id));
        localStorage.setItem(STORAGE_KEY, String(active._id));
      } else if (storedOk) {
        setActiveId(String(stored));
      } else if (list[0]) {
        setActiveId(String(list[0]._id));
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectEnvironment = useCallback(
    async (id) => {
      setActiveId(id);
      localStorage.setItem(STORAGE_KEY, id);
      if (id) {
        try {
          await api(`/api/environments/${id}`, { method: 'PUT', body: { isActive: true } });
          await refresh();
        } catch {
          /* still use local selection */
        }
      }
    },
    [refresh]
  );

  const createEnvironment = useCallback(async (name, variables) => {
    const data = await api('/api/environments', { method: 'POST', body: { name, variables } });
    await refresh();
    return data.environment;
  }, [refresh]);

  const updateEnvironment = useCallback(
    async (id, patch) => {
      await api(`/api/environments/${id}`, { method: 'PUT', body: patch });
      await refresh();
    },
    [refresh]
  );

  const deleteEnvironment = useCallback(
    async (id) => {
      await api(`/api/environments/${id}`, { method: 'DELETE' });
      if (activeId === id) {
        setActiveId(null);
        localStorage.removeItem(STORAGE_KEY);
      }
      await refresh();
    },
    [refresh, activeId]
  );

  const value = useMemo(
    () => ({
      environments,
      activeId,
      loading,
      refresh,
      selectEnvironment,
      createEnvironment,
      updateEnvironment,
      deleteEnvironment,
    }),
    [
      environments,
      activeId,
      loading,
      refresh,
      selectEnvironment,
      createEnvironment,
      updateEnvironment,
      deleteEnvironment,
    ]
  );

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error('useEnvironment outside EnvironmentProvider');
  return ctx;
}
