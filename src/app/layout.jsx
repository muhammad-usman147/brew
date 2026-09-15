import '@/styles/globals.css'
import { Suspense } from 'react'
import NavigationProgressBar from '@/components/NavigationProgressBar'

export const metadata = {
  title: 'Brew - Influencer Marketplace',
  description: 'Connect brands with authentic influencers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}

