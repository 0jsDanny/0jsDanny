import { useState, useEffect } from 'react';
import { useMode } from '../../contexts/ModeContext';
import { NavbarPublic } from './NavbarPublic';
import { SidebarAdmin } from './SidebarAdmin';
import { SidebarCompany } from './SidebarCompany';
import { HeaderAdmin } from './HeaderAdmin';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
    const { role } = useMode();
    const isPublic = role === 'public';
    const isCompany = role === 'company';

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (isPublic) {
        return (
            <div className="min-h-screen bg-slate-50 relative selection:bg-accent-500/30">
                <NavbarPublic />
                <main className="pt-16 min-h-screen">
                    <Outlet />
                </main>
            </div>
        );
    }

    // Admin/Company Layout
    return (
        <div className="flex h-screen font-sans antialiased overflow-hidden bg-gray-50">
            {isCompany ? (
                <SidebarCompany
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    isMobile={isMobile}
                />
            ) : (
                <SidebarAdmin
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    isMobile={isMobile}
                />
            )}

            <div className="flex-1 flex flex-col transition-all duration-300 min-w-0 h-full">
                <HeaderAdmin toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <div className="admin-page-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
