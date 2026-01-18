import Login from './login/page';
import Dashboard from './admin/dashboard/page';

export default function Home() {
  const isLoggedIn = false; // replace with your auth logic

  return isLoggedIn ? <Dashboard /> : <Login />;
}
