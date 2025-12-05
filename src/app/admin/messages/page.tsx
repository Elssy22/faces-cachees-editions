'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Mail, MailOpen, Trash2 } from 'lucide-react'

type Message = {
  id: string
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  read: boolean | null
  created_at: string | null
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setMessages(data)
    }
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', id)

    if (!error) {
      setMessages(
        messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (!error) {
      setMessages(messages.filter((msg) => msg.id !== id))
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
    }
  }

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message)
    if (!message.read) {
      markAsRead(message.id)
    }
  }

  const unreadCount = messages.filter((msg) => !msg.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">
          Messages de contact
        </h1>
        <p className="text-gray-600">
          {messages.length} messages au total
          {unreadCount > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({unreadCount} non lus)
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages list */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      } ${!message.read ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="flex items-start gap-3">
                        {message.read ? (
                          <MailOpen className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              !message.read ? 'font-bold' : ''
                            }`}
                          >
                            {message.first_name} {message.last_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {message.created_at ? formatDate(message.created_at) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    Aucun message
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">
                          {selectedMessage.first_name} {selectedMessage.last_name}
                        </span>
                        <span>•</span>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedMessage.created_at ? formatDate(selectedMessage.created_at) : '-'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button asChild>
                    <a href={`mailto:${selectedMessage.email}`}>
                      Répondre par email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez un message pour le lire</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
