import { Outlet, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import React from 'react';
import Navbar from '../components/Navbar.js';
import BreadcrumbMedSti from '../components/BreadcrumbMedSti.js';
import { useFeed } from '../hooks/useFeed.js';
import FeedAlerts from '../components/Feed/FeedAlerts.js';
import 'animate.css';


export const SlugContext = React.createContext<string | undefined>(undefined);

export default function Layout() {
    const { slug } = useParams<{ slug: string }>();
    const { feed } = useFeed(slug);

    return (
        <SlugContext.Provider value={slug}>
            <div className="w-full min-h-screen bg-[url('/backgrounds/bg.webp')] bg-cover bg-center bg-fixed">
                <div className="w-full max-w-screen-sm mx-auto px-4 py-4 overflow-x-hidden">
                    <div className="bg-white rounded-md shadow-sm overflow-hidden">
                        <header className="bg-gradient-to-b from-gray-200 to-white border-b border-gray-300 shadow-sm">
                            <Navbar />
                        </header>

                        <BreadcrumbMedSti />

                        {feed.length > 0 && (
                            <div className="mx-1">
                                <FeedAlerts />
                            </div>
                        )}

                        <main className="py-1 px-1 min-h-[60vh]">
                            <div className="animate__animated animate__fadeIn animate__faster">
                                <Outlet />
                            </div>
                        </main>
                    </div>
                </div>

                <Toaster
                    position="top-center"
                    mobileOffset={{ top: '35vh' }}
                    offset={{ top: '35vh' }}
                    duration={1500}
                />

            </div>
        </SlugContext.Provider>
    );
}
