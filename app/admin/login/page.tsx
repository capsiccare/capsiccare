import { redirect } from 'next/navigation'

export default function AdminLoginPage() {
  redirect('/portal/login?portal=admin')
}
