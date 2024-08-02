import { Copy } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ReactNode, useEffect, useState } from 'react'
import { tradeMetrics } from './calculate'
import { getTokenSymbol } from '@/lib/web3/get-symbol'

interface SingleTxProps {
  data: any
}

export default function SingleTx({ data }: SingleTxProps) {
  const [tradeMetricData, setTradeMetricData] = useState<any>({})
  const [transformedData, setTransformedData] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (data && data.decodedInput && data.decodedInput.data && data.price) {
          const metrics = await tradeMetrics(data.decodedInput.data, data.price)
          setTradeMetricData(metrics)
        } else {
          console.error('Invalid data structure:', data)
        }
      } catch (error) {
        console.error('Error fetching trade metrics:', error)
      }
    }

    if (data) {
      fetchData()
    }
  }, [data])

  useEffect(() => {
    if (tradeMetricData) {
      console.log('tradeMetricData', tradeMetricData)
    }
  }),
    [tradeMetricData]

  console.log('data', data)

  function formatAddress(input: string) {
    const trimmedString = input.substring(1, input.length - 1)

    if (trimmedString.length <= 8) {
      return trimmedString
    } else {
      return (
        trimmedString.substring(0, 8) +
        '...' +
        trimmedString.substring(trimmedString.length - 4)
      )
    }
  }

  function removeAfterBracket(inputString: string) {
    const index = inputString.indexOf('(')
    return index === -1 ? inputString : inputString.substring(0, index)
  }

  const isNumericKey = (key: string) => /^\d+$/.test(key)
  const formatTimestamp = (timestamp: number) => {
    // time in HH:MM  format ( 24hr )
    return new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
      hour12: false,
    })
  }

  useEffect(() => {
    if (data?.decodedInput?.data) {
      const fetchSymbols = async () => {
        const transformedEntries = await Promise.all(
          Object.entries(data.decodedInput.data).map(async ([key, value]) => {
            if (key === 'pairBase' || key === 'tokenIn') {
              value = await getTokenSymbol(value as string)
            } else if (typeof value === 'boolean') {
              value = value.toString()
            }
            return [key, value]
          })
        )
        setTransformedData(Object.fromEntries(transformedEntries))
      }

      if (data?.decodedInput?.data) {
        fetchSymbols()
      }
    }
  }, [data?.decodedInput?.data])

  return data ? (
    <Card className='overflow-hidden' x-chunk='dashboard-05-chunk-4'>
      <CardHeader className='flex flex-row items-start bg-muted/50'>
        <div className='grid gap-0.5'>
          <CardTitle className='group flex items-center gap-2 text-lg'>
            <Badge>{removeAfterBracket(data.methodSignature)}</Badge>{' '}
            <Badge variant={'secondary'}>{formatTimestamp(data.timestamp)}</Badge>{' '}
            <Badge variant='destructive'>
              BLOCK {formatAddress(data.hash).toUpperCase()}
            </Badge>
            <Button
              size='icon'
              variant='outline'
              className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
            >
              <Copy className='h-3 w-3' />
              <span className='sr-only'>Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription className='text-xs mt-1'>
            From # {data.from}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='p-6 text-sm'>
        <div className='grid gap-0'>
          <div className='font-semibold'>Tx Details</div>

          <div>
            <Badge variant='secondary' className='w-25 mr-2 my-0.5'>
              BLOCK HASH
            </Badge>
            {formatAddress(data.txData.blockHash)}
          </div>
          <div>
            <Badge variant='secondary' className='w-25 mr-2 my-0.5'>
              BLOCK NUMBER
            </Badge>
            {parseInt(data.txData.blockNumber, 16)}
          </div>
          <div>
            {' '}
            <Badge variant='secondary' className='w-25 mr-2 my-0.5'>
              CHAIN-ID
            </Badge>{' '}
            {parseInt(data.txData.chainId, 16)}
          </div>
          <div className='text-xs'>
            {' '}
            <Badge variant='secondary' className='w-25 mr-2 my-0.5'>
              FROM
            </Badge>{' '}
            {data.txData.from}
          </div>
          <div className='text-xs'>
            {' '}
            <Badge variant='secondary' className='w-25 mr-2 my-0.5'>
              TO
            </Badge>{' '}
            {data.txData.to}
          </div>
          <div className='text-xs'>
            <Badge variant='secondary' className='w-25 mr-2 my-0.5'>
              VALUE
            </Badge>{' '}
            {data.txData.value}
          </div>
          <Separator className='my-2' />
          <ul className='grid gap-3'>
            <li className='flex items-center justify-between'>
              <Badge variant='destructive' className='mr-2'>
                METHOD: {data.methodSignature}
              </Badge>
            </li>
          </ul>
        </div>
        <Separator className='my-4' />

        <div className='grid grid-cols-2 gap-4'>
          <div className='grid gap-3'>
            <div className='font-semibold'>Decoded Input</div>

            {/*    labels currently only work for openTradeBNB method  */}
            {transformedData && (
              <div>
                {Object.entries(transformedData)
                  .filter(([key]) => !isNumericKey(key))
                  .map(([key, value]) => (
                    <div className='flex' key={key}>
                      <Badge variant='secondary' className='w-20 mr-2 my-0.5'>
                        {key}:
                      </Badge>{' '}
                      <div className='text-xs flex-auto'>
                        {typeof value === 'boolean'
                          ? value.toString()
                          : (value as ReactNode)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <Separator className='my-4' />
        <div className='grid gap-3'>
          <div className='font-semibold'>Trade Information</div>
          <dl className='grid gap-3'>
            <div className='flex items-center justify-between'>
              {tradeMetricData && (
                <div>
                  <div>Initial Margin: {tradeMetricData.initialMargin}</div>
                  <div>
                    Initial Margin USD:{' '}
                    <strong>{tradeMetricData.initialMarginUSD}</strong>
                  </div>
                  <div>
                    Leverage: <strong>{tradeMetricData.leverage}</strong>
                  </div>
                  <div>
                    Total Size: <strong>{tradeMetricData.totalSize}</strong>
                  </div>
                  <div>Total Size BNB: {tradeMetricData.totalSizeBNB}</div>
                </div>
              )}
            </div>
          </dl>
        </div>
      </CardContent>
      <CardFooter className='flex flex-row items-center border-t bg-muted/50 px-6 py-3'>
        <div className='text-xs text-muted-foreground'>
          Updated <time dateTime='2023-11-23'>Now</time>
        </div>
      </CardFooter>
    </Card>
  ) : (
    <div className='flex items-center justify-center h-100'>
      no transaction selected
    </div>
  )
}
