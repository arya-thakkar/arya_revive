import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white">
      <Outlet />
    </div>
  )
}
