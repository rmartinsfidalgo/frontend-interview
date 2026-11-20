import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../components/AppLayout'
import { NotFound } from '../components/NotFound'
import { DashboardPage } from '../pages/DashboardPage'
import { NotificationDetailPage } from '../pages/NotificationDetailPage'


export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/notifications/:id',
        element: <NotificationDetailPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

