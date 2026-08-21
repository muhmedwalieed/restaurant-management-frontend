import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { MobileNav } from './MobileNav.jsx';
import { ContentContainer } from './ContentContainer.jsx';

export const AppShell = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base flex flex-row font-sans text-txt-primary">
      {/* Sidebar for Desktop & Tablet */}
      <Sidebar isCollapsed={isSidebarCollapsed} />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <ContentContainer>
          <Outlet />
        </ContentContainer>
      </div>
    </div>
  );
};
