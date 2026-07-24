import DashboardNav from '../DashboardNav'
import Toast from '../Toast'
import './DashboardLayout.css'

export default function DashboardLayout({ role, children, toast, onToastClose }) {
  return (
    <div className="dashboard-body">
      <DashboardNav role={role} />
      <div className="dashboard-container">{children}</div>
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={onToastClose} />
      )}
    </div>
  )
}
