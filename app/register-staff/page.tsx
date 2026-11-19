import { redirect } from 'next/navigation'

export default function RegisterStaffDirectPage() {
  redirect('/register?role=staff')
}
