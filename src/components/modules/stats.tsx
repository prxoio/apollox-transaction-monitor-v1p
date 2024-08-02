import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Card, CardDescription, CardHeader,
  CardTitle
} from '@/components/ui/card'

const DUNE_API_KEY = process.env.DUNE_API_KEY

const Stats = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [volume, setVolume] = useState(0)

  useEffect(() => {
    const options = {
      method: 'GET',
      url: 'https://api.dune.com/api/v1/query/3089021/results',
      params: { limit: '1000' },
      headers: { 'X-Dune-API-Key': DUNE_API_KEY },
    }

    axios
      .request(options)
      .then(function (response: { data: React.SetStateAction<null> }) {
        console.log(response.data)
        setData(response.data)
        setLoading(false)
      })
      .catch(function (error: React.SetStateAction<null>) {
        console.error(error)
        setError(error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const newVolume = (data as any)?.result?.rows?.[0]?.bsc_daily_total_trade_volume
    setVolume(newVolume)
  }, [data])

  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(volume)

  if (error) return <div>Error: {(error as Error).message}</div>

  return (
    <div>
      <Card className='mx-6'>
        <CardHeader className='p-4 pl-6'>
          <CardTitle>Trade Volume</CardTitle>
          <CardDescription>
            {' '}
            <strong>{formattedNumber} USDT</strong>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Stats