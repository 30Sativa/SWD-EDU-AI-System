import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

export default function StudentLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc]">
            <ScrollToTop />
            <StudentHeader />

            <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-12 py-10 animate-in fade-in duration-700">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
