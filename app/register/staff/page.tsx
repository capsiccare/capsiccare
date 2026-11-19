import { redirect } from 'next/navigation'

export default function RegisterStaffPage() {
  redirect('/register?role=staff')
}
