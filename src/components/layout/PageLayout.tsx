import React, { forwardRef } from 'react';
import Header from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
}

const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(({ 
  children, 
  showHeader = true,
  className = ''
}, ref) => {
  return (
    <div ref={ref} className={`page-layout ${className}`}>
      {showHeader && <Header />}
      <main className="page-content">
        {children}
      </main>
    </div>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;