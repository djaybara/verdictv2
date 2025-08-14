import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Accueil + page question publiques
  publicRoutes: [
    '/',
    '/q/(.*)',

    // API publiques pour lecture
    '/api/questions',
    '/api/questions/(.*)',
  ],
})

export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
