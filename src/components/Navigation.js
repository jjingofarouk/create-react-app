import React from 'react';
import { ShoppingCart, CreditCard, TrendingDown, Banknote, FileText } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "sales", name: "Sales", icon: ShoppingCart },
    { id: "debts", name: "Debts", icon: CreditCard },
    { id: "expenses", name: "Expenses", icon: TrendingDown },
    { id: "bank", name: "Bank", icon: Banknote },
    { id: "reports", name: "Reports", icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

export default Navigation;