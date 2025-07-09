import '@/global.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/routes'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { ThemeProvider } from './components/theme-provider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'
import { AuthProvider } from './contexts/authContext'
import { HumanResourcesProvider } from './contexts/rhContext'
import { PatientProvider } from './contexts/patientContext'
import { CollaboratorProvider } from './contexts/collaboratorContext'
import { HabilityProvider } from './contexts/habilitiesContext'
import { ScaleProvider } from './contexts/scaleContext'
import { DocumentsProvider } from './contexts/docsContext'
import { ComplaintsProvider } from './contexts/complaintsContext'
import { PaymentProvider } from './contexts/paymentContext'
import { ProdutivityProvider } from './contexts/produtivityContext'

export function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <AuthProvider>
        <HumanResourcesProvider>
          <PatientProvider>
            <CollaboratorProvider>
              <HabilityProvider>
                <DocumentsProvider>
                  <ScaleProvider>
                    <ComplaintsProvider>
                      <PaymentProvider>
                        <ProdutivityProvider>
                        <HelmetProvider>
                          <Helmet titleTemplate='%s | ProSaude' />
                          <Toaster richColors />
                          <QueryClientProvider client={queryClient}>
                            <RouterProvider router={router} />
                          </QueryClientProvider>
                        </HelmetProvider>
                        </ProdutivityProvider>
                      </PaymentProvider>
                    </ComplaintsProvider>
                  </ScaleProvider>
                </DocumentsProvider>
              </HabilityProvider>
            </CollaboratorProvider>
          </PatientProvider>
        </HumanResourcesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
