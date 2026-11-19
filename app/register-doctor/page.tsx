import { redirect } from 'next/navigation'

export default function RegisterDoctorDirectPage() {
  redirect('/register?role=doctor')
}
