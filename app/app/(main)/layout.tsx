import { AppLayoutHeader } from '@/components/AppLayoutHeader'
import { getChallengesData } from '@/lib/challenges'
import { SidebarWrapper } from '@/components/layouts/SidebarWrapper'
import { MainLayoutClient } from '@/components/layouts/MainLayoutClient'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch challenges data once on the server
  const data = getChallengesData()

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <AppLayoutHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Sidebar */}
        <SidebarWrapper challenges={data.challenges} />

        {/* Page content (headers + main content + persistent editor) */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <MainLayoutClient utilsTypes={data.utils}>
            {children}
          </MainLayoutClient>
        </div>
      </div>
    </div>
  )
}
