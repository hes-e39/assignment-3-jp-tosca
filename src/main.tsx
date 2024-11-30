import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createHashRouter } from 'react-router-dom';
import HistoryView from './views/HistoryView';

import './index.css';
import TimersContextProvider from './components/context/TimersContextProvider';
import { HeaderButton } from './components/generic/TimerComps';
import AddView from './views/AddView';
import TimersView from './views/TimersView';

const PageIndex = () => {
    return (
        <>
            <div className="bg-gray-800 mx-auto px-6 py-3 flex items-center">
                <div className="bg-gray-800 absolute top-0 right-0 left-0 flex justify-center space-x-4 text-6xl p-5">
                    <h3 className="text-3xl font-bold text-gray-600">Assignment 3</h3>
                    <HeaderButton buttonLabel=" 💪 Workout" targetParam="/" />
                    <HeaderButton buttonLabel=" ⌚ Add Timer" targetParam="/add" />
                    <HeaderButton buttonLabel=" 🗒️ My Workout History" targetParam="/history" />
                </div>
            </div>

            <TimersContextProvider>
                <Outlet />
            </TimersContextProvider>
        </>
    );
};

const router = createHashRouter([
    {
        path: '/',
        element: <PageIndex />,
        children: [
            {
                index: true,
                element: <TimersView />,
            },
            {
                path: '/add',
                element: <AddView />,
            },
            {
                path: '/history',
                element: <HistoryView />,
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
