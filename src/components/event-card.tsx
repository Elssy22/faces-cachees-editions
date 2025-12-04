import { Calendar, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface EventCardProps {
  id: string
  title: string
  description: string | null
  eventDate: string
  location: string | null
}

export function EventCard({ title, description, eventDate, location }: EventCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-black text-white">
            <span className="text-xs font-medium">
              {new Date(eventDate).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
            </span>
            <span className="text-xl font-bold">
              {new Date(eventDate).getDate()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
            <div className="mt-3 flex flex-col gap-1 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(eventDate)}</span>
              </div>
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
