import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

export default function StudentLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]"> {/* Slightly cooler gray background */}
            <ScrollToTop />
            <StudentHeader />

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
