/**
 * Global Loading Component
 * 
 * This is the default loading UI for all pages in the app
 * Next.js will show this while pages are loading
 */

import { PageLoader } from "@/components/ui/preloader"

export default function Loading() {
  return <PageLoader message="جاري التحميل..." />
}








