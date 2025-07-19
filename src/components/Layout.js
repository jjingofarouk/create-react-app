import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

const Layout = ({ user, activeTab, setActiveTab, children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20">
        {children}
      </main>

      {user && (
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      )}
    </div>
  );
};

export default Layout;