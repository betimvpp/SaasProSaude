import { ModeToggle } from '@/components/mode-toggle'
import { Profile } from '@/components/profile'
import { SideBar } from '@/components/side-bar'
import { Separator } from '@/components/ui/separator'
import supabase from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export function AppLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      const session = data.session;

      if (!session || error) {
        navigate('/login', { replace: true });
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(( session) => {
      if (session === null) {
        navigate('/login', { replace: true });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  if (loading) return null;

  return (
    <div className='h-screen flex overflow-hidden'>
      <div className='h-full min-w-[12%] p-8 default:bg-primary  shadow-lg'>
        <Profile />
        <SideBar />
      </div>
      <Separator orientation='vertical' />
      <div className='w-full h-screen p-8 flex gap-2'>
        <Outlet />
        <span className="absolute top-8 right-8">
          <ModeToggle />
        </span>
      </div>
    </div>
  )
}
