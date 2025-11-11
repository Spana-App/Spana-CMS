import './App.css'
import { DashboardSidebar } from './components/sidebar'
// import { DashboardHeader } from './components/dashboardheader'

function App() {
  return (
    <>
    <aside>
      <DashboardSidebar activeTab="overview" onTabChange={() => {}} />
    </aside>
    {/* <header>
      <DashboardHeader />
    </header> */}
    </>
  )
}

export default App
