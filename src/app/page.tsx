import { redirect } from 'next/navigation';

// Temporary: redirect to login. Once auth is wired, this checks session.
export default function RootPage() {
  redirect('/login');
}
