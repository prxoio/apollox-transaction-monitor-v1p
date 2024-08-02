import { useEffect, useState } from 'react'
import * as React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { PiNetworkFill } from 'react-icons/pi'
import { Card } from '../ui/card'
import Transactions from './transactions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

interface MonitorProps {
  onCallbackMain: (data: any) => void // Callback prop
}
export default function Home({ onCallbackMain }: MonitorProps) {
  const [messages, setMessages] = useState<{ content: any; isNew: boolean }[]>([])
  const [messageCount, setMessageCount] = useState(0)
  const [newMsg, setNewMsg] = useState(false)

  let ws: WebSocket | null = null

  useEffect(() => {
    // new WebSocket connection
    ws = new WebSocket('wss://apollox-vm.prxo.io')

    // listener for incoming messages
    ws.addEventListener('message', (event) => {
      try {
        // parse incoming message
        const parsedMessage = JSON.parse(event.data)
        const newMessage = { content: parsedMessage, isNew: true }

        // update state with new message
        setMessages((prevMessages) => [newMessage, ...prevMessages])
        setMessageCount((prevCount) => prevCount + 1)
        setNewMsg(true)

        // reset 'isNew' flag after 0.1 seconds
        setTimeout(() => {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg === newMessage ? { ...msg, isNew: false } : msg
            )
          )
          setNewMsg(false)
        }, 100)
      } catch (e) {
        console.error('Error parsing JSON:', e)
      }
    })

    // close WebSocket connection
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  const handleCallback = (data: any) => {
    console.log('Received message from child component:', data)
    onCallbackMain(data)
  }

  return (
    <div>
      <Card className='p-0 overflow-hidden'>
        <div className='h-52 w-50 rounded-md border overflow-hidden relative'>
          <ScrollArea className='h-full overflow-y-auto overflow-x-auto'>
            <div className='p-4'>
              <div className='flex items-center mb-4'>
                <h4 className='text-sm font-medium leading-none mr-2'>
                  WebSocket Messages
                </h4>
                <PiNetworkFill className={`animate-pulse mr-2`} />
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    newMsg ? 'bg-red-500' : ''
                  }`}
                ></div>
                <div className='text-xs'> {messageCount}</div>
              </div>
              <Separator className='my-2.5' />
              {messages.map(({ content, isNew }, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`text-sm break-words ${isNew ? 'text-blue-300' : ''}`}
                  >
                    {JSON.stringify(content)}
                  </div>{' '}
                  <Separator className='my-2' />
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </div>
        <Alert className=''>
          <Terminal className='h-4 w-4' />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            WebSocket messages from the NodeVM are currently disabled due to cost
            constraints. The transactions below are now static, for demonstration
            purposes only.
          </AlertDescription>
        </Alert>
      </Card>
      <Transactions onCallback={handleCallback} />
    </div>
  )
}
