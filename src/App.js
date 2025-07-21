import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { User, ShoppingCart, CreditCard, TrendingDown, Banknote, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import SalesPage from './components/SalesPage';
import ExpensesPage from './components/ExpensesPage';
import DebtsPage from './components/DebtsPage';
import ProfilePage from './components/ProfilePage';
import ReportsPage from './components/ReportsPage';
import BankPage from './components/BankPage';
import Auth from './components/Auth';

const App = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(currentScrollY <= lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const Header = () => {
    const navigate = useNavigate();
    
    const handleSignOut = () => {
      setActiveTab("sales");
      auth.signOut();
      navigate('/');
    };

    return (
      <header className={`bg-white border-b border-neutral-200 fixed top-0 left-0 right-0 z-50 shadow-sm transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">
              RichBooks
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  setActiveTab("profile");
                  navigate('/profile');
                }}
                className={`p-2 rounded-full transition-all duration-200 ${
                  activeTab === "profile" 
                    ? "bg-blue-100 text-blue-600" 
                    : "hover:bg-neutral-100 text-neutral-600"
                }`}
                title="Profile"
                aria-label="Profile"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <button
                className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 hover:shadow-md transition-all duration-200 text-sm sm:text-base"
                onClick={handleSignOut}
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          )}
        </div>
      </header>
    );
  };

  const Navigation = () => {
    const navigate = useNavigate();
    
    const tabs = [
      { id: "sales", name: "Sales", icon: ShoppingCart, path: '/sales' },
      { id: "debts", name: "Debts", icon: CreditCard, path: '/debts' },
      { id: "expenses", name: "Expenses", icon: TrendingDown, path: '/expenses' },
      { id: "bank", name: "Bank", icon: Banknote, path: '/bank' },
      { id: "reports", name: "Reports", icon: FileText, path: '/reports' },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(tab.path);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-1 text-xs font-medium transition-all duration-200 relative min-h-[60px] sm:min-h-[70px] ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
                aria-label={tab.name}
              >
                {activeTab === tab.id && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
                )}
                
                <tab.icon 
                  className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${
                    activeTab === tab.id ? 'scale-110' : ''
                  } transition-transform duration-200`} 
                />
                
                <span className={`text-[10px] sm:text-xs leading-tight ${
                  activeTab === tab.id ? 'font-semibold' : ''
                }`}>
                  {tab.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    );
  };

  const ErrorScreen = () => {
    const retry = () => {
      setError(null);
      window.location.reload();
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto mb-4" />
          
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2">
            Oops! Something went wrong
          </h2>
          
          <p className="text-neutral-600 text-center max-w-md text-sm sm:text-base mb-6">
            {error || "An error occurred. Please try again."}
          </p>
          
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 text-sm sm:text-base"
            onClick={retry}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-neutral-500">
            If the problem persists, please check your internet connection
          </p>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-[80px] sm:pb-[90px]">
          {user ? (
            <Routes>
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/bank" element={<BankPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<ErrorScreen />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="*" element={<Auth />} />
            </Routes>
          )}
        </main>
        {user && <Navigation />}
      </div>
    </Router>
  );
};

export default App;