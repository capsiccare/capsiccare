import { redirect } from 'next/navigation'

export default function PortalRegisterStaffPage() {
  redirect('/register?role=staff')
}
