import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { User, ShoppingCart, CreditCard, TrendingDown, Banknote, FileText, AlertCircle, RefreshCw, LogOut, Menu } from 'lucide-react';
import SalesPage from './components/SalesPage';
import ExpensesPage from './components/ExpensesPage';
import DebtsPage from './components/DebtsPage';
import ProfilePage from './components/ProfilePage';
import ReportsPage from './components/ReportsPage';
import BankPage from './components/BankPage';
import Auth from './components/Auth';
import { auth } from './firebase';

const App = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useContext(AuthContext);

  const Header = () => {
    const navigate = useNavigate();
    
    const handleSignOut = () => {
      setActiveTab("sales");
      auth.signOut();
      navigate('/');
    };

    return (
      <header className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-[100]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Center - RichBooks */}
            <h1 className="text-lg font-semibold text-gray-800 absolute left-1/2 transform -translate-x-1/2">
              RichBooks
            </h1>
            
            {/* Right - User Icon */}
            {user && (
              <button
                onClick={() => {
                  setActiveTab("profile");
                  navigate('/profile');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Profile"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
            <div className="px-4 py-2">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("sales");
                    navigate('/sales');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-700">Sales</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("debts");
                    navigate('/debts');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Debts</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("expenses");
                    navigate('/expenses');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700">Expenses</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("bank");
                    navigate('/bank');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Banknote className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Bank</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("reports");
                    navigate('/reports');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">Reports</span>
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    );
  };

  const Navigation = () => {
    const navigate = useNavigate();
    
    const tabs = [
      { id: "sales", name: "Sales", icon: ShoppingCart, path: '/sales', color: "text-emerald-600" },
      { id: "debts", name: "Debts", icon: CreditCard, path: '/debts', color: "text-orange-600" },
      { id: "expenses", name: "Expenses", icon: TrendingDown, path: '/expenses', color: "text-red-600" },
      { id: "bank", name: "Bank", icon: Banknote, path: '/bank', color: "text-blue-600" },
      { id: "reports", name: "Reports", icon: FileText, path: '/reports', color: "text-purple-600" },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-2xl z-[90]">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(tab.path);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-3 sm:py-4 px-1 text-xs font-medium transition-all duration-300 relative min-h-[70px] sm:min-h-[80px] group ${
                  activeTab === tab.id
                    ? `${tab.color} bg-gradient-to-t from-neutral-50 to-transparent`
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                }`}
                aria-label={tab.name}
              >
                {activeTab === tab.id && (
                  <>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-current to-transparent rounded-full"></div>
                    <div className="absolute inset-x-2 top-0 bottom-0 bg-gradient-to-b from-current/5 to-transparent rounded-b-2xl"></div>
                  </>
                )}
                
                <tab.icon 
                  className={`w-5 h-5 sm:w-6 sm:h-6 mb-1.5 transition-all duration-300 ${
                    activeTab === tab.id ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105'
                  }`} 
                />
                
                <span className={`text-[10px] sm:text-xs leading-tight transition-all duration-300 ${
                  activeTab === tab.id ? 'font-semibold' : 'group-hover:font-medium'
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="text-center max-w-md">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-3">
            Oops! Something went wrong
          </h2>
          
          <p className="text-neutral-600 text-center text-sm sm:text-base mb-8 leading-relaxed">
            {error || "An unexpected error occurred. Don't worry, we'll get this sorted out quickly."}
          </p>
          
          <button
            className="inline-flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base shadow-lg"
            onClick={retry}
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Try Again
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-neutral-400">
            If the problem persists, please check your internet connection or contact support
          </p>
        </div>
      </div>
    );
  };

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-neutral-600 font-medium">Loading RichBooks...</p>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Fixed Header - Always visible */}
        <Header />
        
        {/* Main Content - Properly spaced below header */}
        <main className="pt-[60px] pb-[90px] sm:pb-[100px] min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {error ? (
              <ErrorScreen />
            ) : (
              <div className="animate-in fade-in duration-500">
                <Routes>
                  {user ? (
                    <>
                      <Route path="/sales" element={<SalesPage />} />
                      <Route path="/debts" element={<DebtsPage />} />
                      <Route path="/expenses" element={<ExpensesPage />} />
                      <Route path="/bank" element={<BankPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="*" element={<ErrorScreen />} />
                    </>
                  ) : (
                    <Route path="*" element={<Auth />} />
                  )}
                </Routes>
              </div>
            )}
          </div>
        </main>
        
        {/* Navigation - Only show when user is authenticated */}
        {user && <Navigation />}
      </div>
    </Router>
  );
};

export default App;