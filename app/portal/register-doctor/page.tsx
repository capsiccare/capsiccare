import { redirect } from 'next/navigation'

export default function PortalRegisterDoctorPage() {
  redirect('/register?role=doctor')
}
