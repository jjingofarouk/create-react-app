// DataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth, collection, query, where, onSnapshot } from './firebase';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    sales: [],
    debts: [],
    expenses: [],
    bank: [],
    reports: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Define collections to fetch
    const collections = [
      { name: 'sales', path: 'sales' },
      { name: 'debts', path: 'debts' },
      { name: 'expenses', path: 'expenses' },
      { name: 'bank', path: 'bank' },
      { name: 'reports', path: 'reports' },
    ];

    // Set up real-time listeners with cache-first strategy
    const unsubscribes = collections.map(({ name, path }) => {
      const q = query(collection(db, path), where('userId', '==', user.uid));
      return onSnapshot(
        q,
        { source: 'cache' }, // Prioritize cache
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setData((prev) => ({ ...prev, [name]: items }));
          setLoading(false);
        },
        (err) => {
          // Fallback to server if cache fails and handle errors
          onSnapshot(
            q,
            { source: 'server' },
            (snapshot) => {
              const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              setData((prev) => ({ ...prev, [name]: items }));
              setLoading(false);
            },
            (serverErr) => {
              setError(`Failed to fetch ${name}: ${serverErr.message}`);
              setLoading(false);
            }
          );
        }
      );
    });

    // Cleanup listeners on unmount
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to access data
export const useData = () => useContext(DataContext);