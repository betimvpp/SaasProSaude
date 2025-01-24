import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react";
import { Outlet } from 'react-router-dom'
import { ShortScreen } from "./shortScreen";

export function AuthLayout() {
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

  return (
    <>
      {isSmallScreen ?
        <>
          <ShortScreen />
        </> :
        <div className="flex">
          <div className='h-screen w-9/12 flex flex-col justify-between border-r border-foreground/5 bg-banner bg-center bg-cover bg-no-repeat object-cover p-4 text-muted-foreground'>
            <div className='flex items-center gap-3 text-lg text-foreground'>
            </div>
            <footer className='text-sm text-white font-semibold'>
              All rights reserved to CodeHere® - {new Date().getFullYear()}
            </footer>
          </div>
          <div className="flex items-center justify-center h-screen m-auto w-[25rem] max-w-[25rem]">
            <span className="absolute top-8 right-8">
              <ModeToggle />
            </span>
            <Outlet />
          </div>
        </div>
      }
    </>
  )
}