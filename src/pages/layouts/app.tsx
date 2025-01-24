import { ModeToggle } from '@/components/mode-toggle'
import { Profile } from '@/components/profile'
import { SideBar } from '@/components/side-bar'
import { Separator } from '@/components/ui/separator'
import supabase from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ShortScreen } from './shortScreen'

export function AppLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

    const { data: authListener } = supabase.auth.onAuthStateChange((session) => {
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
    <>
      {isSmallScreen ?
        <>
          <ShortScreen />
        </>
        :
        <div className='h-screen flex overflow-x-hidden'>
          <div className='h-full min-w-[12%] p-8 default:bg-primary  shadow-lg'>
            <Profile />
            <SideBar />
          </div>
          <Separator orientation='vertical' className='h-full' />
          <div className='w-full h-screen p-8 flex'>
            <Outlet />
            <span className="relative ">
              <ModeToggle />
            </span>
          </div>
        </div>

      }
    </>
  )
}
