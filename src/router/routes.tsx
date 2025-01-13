import { Collaborator } from '@/pages/app/collaborator/Collaborator'
import { Dashboard } from '@/pages/app/dashboard/Dashboard'
import { Scale } from '@/pages/app/scale/Scale'
import { HumanResources } from '@/pages/app/humanResources/HumanResources'
import { Patient } from '@/pages/app/patient/Patient'
import { AppLayout } from '@/pages/layouts/app'
import { AuthLayout } from '@/pages/layouts/auth'
import { Login } from '@/pages/login/Login'
import { createBrowserRouter } from 'react-router-dom'
import { Permutation } from '@/pages/app/permutation/Permutation'
import { CreateSchedule } from '@/pages/app/createSchedule/CreateSchedule'
import { ProtectedRoute } from './ProtectedRoute'
import { WelcolmePage } from '@/pages/app/WelcolmePage'
import { Payments } from '@/pages/app/payments/Payments'
import { Complaints } from '@/pages/app/complaints/Complaints'
import { Documents } from '@/pages/app/documents/Documents'
import { RecoverPassword } from '@/pages/login/RecoverPassword'
import { ResetPassword } from '@/pages/login/ResetPassword'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    // errorElement: <NotFound/>,
    children: [
      { path: '/', element: <WelcolmePage /> },
      {
        path: '/dashboard', element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: '/escala', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <Scale />
          </ProtectedRoute>
      },
      {
        path: '/escala/permutas', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <Permutation />
          </ProtectedRoute>
      },
      {
        path: '/escala/criar', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <CreateSchedule />
          </ProtectedRoute>
      },
      {
        path: '/colaboradores', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <Collaborator />
          </ProtectedRoute>
      },
      {
        path: '/gestores', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <HumanResources />
          </ProtectedRoute>
      },
      {
        path: '/pacientes', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <Patient />
          </ProtectedRoute>
      },
      {
        path: '/documentos', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <Documents />
          </ProtectedRoute>
      },
      {
        path: '/reclamacoes', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <Complaints />
          </ProtectedRoute>
      },
      {
        path: '/pagamentos', element:
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <Payments />
          </ProtectedRoute>
      },
    ],
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/login/recuperar-senha', element: <RecoverPassword /> },
      { path: '/login/nova-senha', element: <ResetPassword /> },
    ],
  },

])