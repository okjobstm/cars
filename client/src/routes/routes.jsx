import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import App from '../App'
import ProtectedRoute from '../components/ProtectedRoute'
import ErrorBoundary from '../components/ErrorBoundary'
import { AuthProvider } from '../context/AuthContext'

// Lazy-loaded pages — Vite splits each into its own chunk
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const CarListing = lazy(() => import('../pages/CarListing'))
const CarDetail = lazy(() => import('../pages/CarDetail'))
const Profile = lazy(() => import('../pages/Profile'))
const AdminPanel = lazy(() => import('../pages/AdminPanel'))
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'))
const ResetPassword = lazy(() => import('../pages/ResetPassword'))

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

/**
 * Application routes configuration
 */
const routes = createRoutesFromElements(
  <Route
    path="/"
    element={
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    }
  >
    <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
    <Route path="login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
    <Route path="register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
    <Route path="verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense>} />
    <Route path="reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
    <Route path="cars">
      <Route index element={<Suspense fallback={<PageLoader />}><CarListing /></Suspense>} />
      <Route path=":id" element={<Suspense fallback={<PageLoader />}><CarDetail /></Suspense>} />
    </Route>
    <Route
      path="profile"
      element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}><Profile /></Suspense>
        </ProtectedRoute>
      }
    />
    <Route
      path="admin"
      element={
        <ProtectedRoute adminOnly>
          <Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>
        </ProtectedRoute>
      }
    />
  </Route>
)

/**
 * Router configuration with future flags
 */
export const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true
  }
})

