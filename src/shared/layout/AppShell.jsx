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
    <div className="h-[100dvh] max-h-[100dvh] bg-bg-base flex font-sans text-txt-primary overflow-hidden">
      {}
      <div className="print:hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </div>

      {}
      <div className="print:hidden">
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />
      </div>

      {}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] max-h-[100dvh] overflow-hidden print:h-auto print:max-h-none print:overflow-visible">
        {}
        <div className="print:hidden">
          <Header
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleDesktopSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          />
        </div>

        {}
        <ContentContainer className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </ContentContainer>
      </div>
    </div>
  );
};
