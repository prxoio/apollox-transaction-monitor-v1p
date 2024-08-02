'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import Header from '@/components/template/header'
import MonitoringComponent from '@/components/modules/monitor'
import { useState } from 'react'
import SingleTx from '@/components/modules/singleTx'
export default function Dashboard() {
  const [transaction, setTransaction] = useState<{ data: any }>()

  const handleCallback = (data: any) => {
    console.log('Received:', data)
    setTransaction(data)
  }
  return (
    <div className='overflow-hidden flex min-h-screen w-full flex-col bg-muted/40'>
      <TooltipProvider>
        {/* <Sidebar /> */}
        <div className='overflow-hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
          <Header />
          {/* <Stats /> */}
          <main className='overflow-hidden grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3'>
            <div className='overflow-hidden grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2'>
              <MonitoringComponent onCallbackMain={handleCallback} />
            </div>
            <div className='overflow-hidden'>
              <SingleTx data={transaction} />
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  )
}
