import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CollectionContext = createContext(null);

export function CollectionProvider({ children }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCollections([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api('/api/collections');
      setCollections(data.collections || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCollection = useCallback(
    async (name, description) => {
      const data = await api('/api/collections', { method: 'POST', body: { name, description } });
      await refresh();
      return data.collection;
    },
    [refresh]
  );

  const updateCollection = useCallback(
    async (id, patch) => {
      const data = await api(`/api/collections/${id}`, { method: 'PUT', body: patch });
      await refresh();
      return data.collection;
    },
    [refresh]
  );

  const deleteCollection = useCallback(
    async (id) => {
      await api(`/api/collections/${id}`, { method: 'DELETE' });
      await refresh();
    },
    [refresh]
  );

  const shareCollection = useCallback(async (id) => {
    return api(`/api/collections/${id}/share`, { method: 'POST' });
  }, []);

  const getCollection = useCallback(async (id) => {
    return api(`/api/collections/${id}`);
  }, []);

  const value = useMemo(
    () => ({
      collections,
      loading,
      error,
      refresh,
      createCollection,
      updateCollection,
      deleteCollection,
      shareCollection,
      getCollection,
    }),
    [
      collections,
      loading,
      error,
      refresh,
      createCollection,
      updateCollection,
      deleteCollection,
      shareCollection,
      getCollection,
    ]
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollections() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollections outside CollectionProvider');
  return ctx;
}
