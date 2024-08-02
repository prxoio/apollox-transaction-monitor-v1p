'use client'
import { useEffect, useState } from 'react'
import * as React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ref, query, orderByChild, limitToFirst, onValue } from 'firebase/database'

import { database } from '@/lib/database'

interface TransactionProps {
  onCallback: (data: any) => void
}

export default function Transactions({ onCallback }: TransactionProps) {
  const [txData, setTxData] = useState<any[]>([])
  const [tradeData, setTradeData] = useState<any[]>([])

  useEffect(() => {
    const db = database
    const txRef = ref(db, '/tx')
    const tradeRef = ref(db, '/trade')
    const txQuery = query(txRef, orderByChild('invertedTimestamp'), limitToFirst(25))
    const tradeQuery = query(
      tradeRef,
      orderByChild('invertedTimestamp'),
      limitToFirst(25)
    )

    // Listen for transaction updates
    const unsubscribeTx = onValue(
      txQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          let newData: any[] = Object.values(snapshot.val())
          newData.sort((a, b) => a.invertedTimestamp - b.invertedTimestamp)
          setTxData(newData)
        } else {
          setTxData([])
        }
      },
      (error) => {
        console.error('Transaction error:', error)
      }
    )

    // Listen for trade updates
    const unsubscribeTrade = onValue(
      tradeQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          let newData: any[] = Object.values(snapshot.val())
          newData.sort((a, b) => a.invertedTimestamp - b.invertedTimestamp)
          setTradeData(newData)
        } else {
          setTradeData([])
        }
      },
      (error) => {
        console.error('Trade error:', error)
      }
    )

    return () => {
      unsubscribeTx()
      unsubscribeTrade()
    }
  }, [])

  const formatTxId = (input: string) => {
    const trimmedString = input.substring(0, input.length - 1)
    return trimmedString.slice(-5)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
      hour12: false,
    })
  }

  function formatAddress(input: string) {
    const trimmedString = input.substring(0, input.length - 0)
    if (trimmedString.length <= 8) {
      return trimmedString
    } else {
      return (
        trimmedString.substring(0, 6) +
        '...' +
        trimmedString.substring(trimmedString.length - 4)
      )
    }
  }

  function removeAfterParenthesis(inputString: string) {
    const index = inputString.indexOf('(')
    return index === -1 ? inputString : inputString.substring(0, index)
  }

  const handleRowClick = (data: any) => {
    onCallback(data)
  }

  return (
    <div>
      <Card className='mt-6 p-0 overflow-hidden'>
        <div className='h-100 w-100 rounded-md border overflow-hidden relative'>
          <Tabs defaultValue='all' className='w-[100%]'>
            <CardHeader className='flex flex-row items-center justify-start bg-muted/50 p-2'>
              <CardTitle className='group flex items-center gap-2 text-lg mt-1 mx-6'>
                Transactions
              </CardTitle>
              <TabsList>
                <TabsTrigger value='all'>All Methods</TabsTrigger>
                <TabsTrigger value='trade'>Trade Methods</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value='all'>
              <ScrollArea className='h-full overflow-y-auto max-h-[800px]'>
                <div className='p-4'>
                  {txData.map((tx: any, index: number) => (
                    <React.Fragment key={index}>
                      <div
                        className={`text-sm break-words`}
                        onClick={() => handleRowClick(tx)}
                      >
                        <>
                          <Badge className='w-17 mr-2 text-center'>TX Data</Badge>
                          <Badge variant='outline' className='w-15 mr-2 text-center'>
                            {formatTimestamp(tx.timestamp)}
                          </Badge>

                          <Badge variant='destructive' className='w-20 px-4 mr-2.5'>
                            #{formatTxId(tx.hash)}
                          </Badge>
                          <Badge className='mr-2'>
                            {' '}
                            {removeAfterParenthesis(tx.methodSignature)}
                          </Badge>
                          <Badge variant='outline' className='w-15 mr-2 text-center'>
                            Address: #{formatAddress(tx.from)}
                          </Badge>
                        </>
                      </div>
                      <Separator className='my-2' />
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value='trade'>
              <ScrollArea className='h-full overflow-y-auto max-h-[800px]'>
                <div className='p-4'>
                  {tradeData.map((tx: any, index: number) => (
                    <React.Fragment key={index}>
                      <div
                        className={`text-sm break-words`}
                        onClick={() => handleRowClick(tx)}
                      >
                        <>
                          <Badge className='w-17 mr-2 text-center'>TX Data</Badge>
                          <Badge variant='outline' className='w-15 mr-2 text-center'>
                            {formatTimestamp(tx.timestamp)}
                          </Badge>

                          <Badge variant='destructive' className='w-20 px-4 mr-2.5'>
                            #{formatTxId(tx.hash)}
                          </Badge>
                          <Badge className='mr-2'>
                            {' '}
                            {removeAfterParenthesis(tx.methodSignature)}
                          </Badge>
                          <Badge variant='outline' className='w-15 mr-2 text-center'>
                            Address: #{formatAddress(tx.from)}
                          </Badge>
                        </>
                      </div>
                      <Separator className='my-2' />
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
