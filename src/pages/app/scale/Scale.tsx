import { Helmet } from 'react-helmet-async'
import { ScaleCalendar } from './ScaleCalendar'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export const Scale = () => {

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Helmet title="Escala" />
      <h1 className="text-4xl font-bold textslate mb-2">Escala</h1>

      <div className='w-full justify-end flex gap-2'>
        <Link to={'/escala/permutas'}>
          <Button variant={'outline'} size={'xs'}>
            Permutas
          </Button>
        </Link>

        <Link to={'/escala/criar'}>
          <Button variant={'secondary'} size={'xs'}>
            Adcionar Escala
          </Button>
        </Link>
      </div>

      <div className="h-full max-h-[44rem] w-full shadow-lg border rounded-md">
        <ScaleCalendar />
      </div>
    </div>
  )
}
