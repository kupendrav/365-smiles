import { redirect } from 'next/navigation';

// Redirect old typo URL to correct URL (Issue #26)
export default function RecentDonarsRedirect() {
  redirect('/recentdonors');
}
