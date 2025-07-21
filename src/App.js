import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Renamed for clarity
  const { user, loading } = useContext(AuthContext);

  const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = () => {
      setActiveTab("sales");
      auth.signOut();
      navigate('/');
    };

    return (
      <header className="bg-white/40 backdrop-blur-sm fixed top-0 left-0 right-0 z-[100]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Hamburger Menu (visible on mobile) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 md:hidden"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
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
                className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
                aria-label="Profile"
              >
                <User className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  };

  const Sidebar = () => {
    const navigate = useNavigate();

    const tabs = [
      { id: "sales", name: "Sales", icon: ShoppingCart, path: '/sales', color: "text-emerald-600" },
      { id: "debts", name: "Debts", icon: CreditCard, path: '/debts', color: "text-orange-600" },
      { id: "expenses", name: "Expenses", icon: TrendingDown, path: '/expenses', color: "text-red-600" },
      { id: "bank", name: "Bank", icon: Banknote, path: '/bank', color: "text-blue-600" },
      { id: "reports", name: "Reports", icon: FileText, path: '/reports', color: "text-purple-600" },
    ];

    const handleSignOut = () => {
      setActiveTab("sales");
      auth.signOut();
      navigate('/');
      setIsSidebarOpen(false);
    };

    return (
      <nav
        className={`fixed top-0 left-0 h-screen bg-white/95 backdrop-blur-md border-r border-neutral-200/80 shadow-lg z-[90] w-64 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full pt-16 pb-4 px-4">
          <div className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(tab.path);
                  setIsSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-all duration-300 text-sm font-medium ${
                  activeTab === tab.id
                    ? `${tab.color} bg-gradient-to-r from-neutral-50 to-transparent`
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50'
                }`}
                aria-label={tab.name}
              >
                <tab.icon
                  className={`w-5 h-5 ${
                    activeTab === tab.id ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105'
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Sign Out Button at Bottom */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-100/50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
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
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Header Skeleton */}
        <div className="bg-white/40 backdrop-blur-sm fixed top-0 left-0 right-0 z-[100]">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Skeleton height={36} width={36} borderRadius={8} />
              <Skeleton height={24} width={100} borderRadius={4} />
              <Skeleton height={36} width={36} borderRadius={8} />
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton (visible on desktop) */}
        <div className="fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-md border-r border-neutral-200/80 hidden md:block">
          <div className="flex flex-col h-full pt-16 pb-4 px-4">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} height={40} borderRadius={8} />
              ))}
            </div>
            <Skeleton height={40} borderRadius={8} />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="pt-[60px] pb-6 md:ml-64 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton height={32} width={200} className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <Skeleton height={20} width={80} className="mb-2" />
                    <Skeleton height={36} width={120} />
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <Skeleton height={20} width={80} className="mb-2" />
                    <Skeleton height={36} width={120} />
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                    <Skeleton height={20} width={80} className="mb-2" />
                    <Skeleton height={36} width={120} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Skeleton height={24} width={150} className="mb-4" />
                  <div className="space-y-3">
                    <Skeleton height={60} />
                    <Skeleton height={60} />
                    <Skeleton height={60} />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Skeleton height={24} width={150} className="mb-4" />
                  <div className="space-y-3">
                    <Skeleton height={60} />
                    <Skeleton height={60} />
                    <Skeleton height={60} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton height={28} width={180} className="mb-6" />
                <Skeleton height={300} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SkeletonTheme>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Fixed Header - Always visible */}
        <Header />

        {/* Sidebar - Only show when user is authenticated */}
        {user && <Sidebar />}

        {/* Main Content - Adjust margin for sidebar on desktop */}
        <main className="pt-[60px] pb-6 md:ml-64 min-h-screen">
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
      </div>
    </Router>
  );
};

export default App;