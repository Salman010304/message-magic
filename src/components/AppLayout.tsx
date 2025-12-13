import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { MessageModal } from '@/components/MessageModal';
import { StudentDetailModal } from '@/components/StudentDetailModal';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { StudentsTab } from '@/components/tabs/StudentsTab';
import { HistoryTab } from '@/components/tabs/HistoryTab';
import { AddTransactionTab } from '@/components/tabs/AddTransactionTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';

export function AppLayout() {
  const { activeTab, viewingStudent, setViewingStudent } = useApp();
  
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'students':
        return <StudentsTab />;
      case 'history':
        return <HistoryTab />;
      case 'add':
        return <AddTransactionTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Tab Content */}
        <div className="flex-1 md:overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-6 -mt-10 md:mt-0 relative z-10">
          {/* Desktop Tab Header */}
          <div className="hidden md:block mb-6">
            <h1 className="text-2xl font-bold text-foreground capitalize">
              {activeTab === 'add' ? 'Add Entry' : activeTab}
            </h1>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'dashboard' && 'Overview of your finances'}
              {activeTab === 'students' && 'Manage your students'}
              {activeTab === 'history' && 'View all transactions'}
              {activeTab === 'add' && 'Record a new transaction'}
              {activeTab === 'settings' && 'Configure your preferences'}
            </p>
          </div>
          
          {renderTab()}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      {/* Modals */}
      <MessageModal />
      <StudentDetailModal 
        student={viewingStudent} 
        onClose={() => setViewingStudent(null)} 
      />
    </div>
  );
}
