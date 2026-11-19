import { redirect } from 'next/navigation'

export default function RegisterDoctorPage() {
  redirect('/register?role=doctor')
}
