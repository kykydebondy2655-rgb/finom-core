import React from 'react';
import Header from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showHeader = true,
  className = ''
}) => {
  return (
    <div className={`page-layout ${className}`}>
      {showHeader && <Header />}
      <main className="page-content">
        {children}
      </main>

      <style>{`
        .page-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .page-content {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default PageLayout;
