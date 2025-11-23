"use client"

import { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, Users, MapPin, DollarSign, Eye, Star, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppContext, type Event } from '@/app/context/AppContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function EventsManagement() {
  const context = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Mock events data
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Summer Pottery Exhibition',
      description: 'Showcase your finest ceramic works in our annual summer exhibition. All studio members are invited to participate.',
      type: 'exhibition',
      date: '2025-07-15',
      endDate: '2025-07-30',
      location: 'Main Gallery, Downtown Arts District',
      organizer: 'Artisan Clay Studio',
      organizerId: 'studio1',
      maxParticipants: 25,
      currentParticipants: ['artist1', 'artist2', 'artist3', 'artist4', 'artist5'],
      requirements: ['Must be studio member for 3+ months', 'Maximum 3 pieces per artist', 'Professional quality work only'],
      pricing: {
        participationFee: 50,
        commissionRate: 20
      },
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'],
      isPublic: true,
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Pottery Market Weekend',
      description: 'Set up your booth and sell your pottery directly to the public. Great opportunity for emerging artists.',
      type: 'sale',
      date: '2025-06-28',
      endDate: '2025-06-29',
      location: 'City Farmers Market, Main Street',
      organizer: 'Downtown Arts Collective',
      organizerId: 'external1',
      maxParticipants: 15,
      currentParticipants: ['artist1', 'artist6', 'artist7'],
      requirements: ['Valid business license', 'Professional display setup', 'Family-friendly artwork only'],
      pricing: {
        participationFee: 75,
        commissionRate: 0
      },
      images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop'],
      isPublic: true,
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Raku Firing Workshop',
      description: 'Community raku firing event. Bring your glazed pieces and experience this ancient Japanese technique.',
      type: 'workshop',
      date: '2025-07-05',
      location: 'Studio Outdoor Kiln Area',
      organizer: 'Sarah Wilson',
      organizerId: 'instructor1',
      maxParticipants: 12,
      currentParticipants: ['student1', 'student2', 'artist3'],
      requirements: ['Bring your own glazed pottery', 'Closed-toe shoes required', 'Heat-resistant clothing'],
      pricing: {
        participationFee: 35
      },
      isPublic: false,
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Regional Ceramics Competition',
      description: 'Submit your best work for the annual regional ceramics competition. Winners receive cash prizes and exhibition opportunities.',
      type: 'competition',
      date: '2025-08-15',
      location: 'State Arts Center',
      organizer: 'Regional Arts Council',
      organizerId: 'external2',
      requirements: ['Original work only', 'Completed within last 2 years', 'Entry fee required'],
      pricing: {
        participationFee: 25
      },
      currentParticipants: ['artist1', 'artist2'],
      images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=400&fit=crop'],
      isPublic: true,
      status: 'upcoming'
    }
  ]);

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    type: 'exhibition',
    date: '',
    endDate: '',
    location: '',
    organizer: context.currentUser?.name || '',
    organizerId: context.currentUser?.id || '',
    maxParticipants: 20,
    currentParticipants: [],
    requirements: [],
    pricing: {
      participationFee: 0,
      commissionRate: 0
    },
    images: [],
    isPublic: true,
    status: 'upcoming'
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || event.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exhibition': return 'bg-purple-100 text-purple-800';
      case 'sale': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'competition': return 'bg-orange-100 text-orange-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const eventToCreate: Event = {
      id: Date.now().toString(),
      ...newEvent as Event
    };

    setEvents(prev => [eventToCreate, ...prev]);
    setNewEvent({
      title: '',
      description: '',
      type: 'exhibition',
      date: '',
      endDate: '',
      location: '',
      organizer: context.currentUser?.name || '',
      organizerId: context.currentUser?.id || '',
      maxParticipants: 20,
      currentParticipants: [],
      requirements: [],
      pricing: {
        participationFee: 0,
        commissionRate: 0
      },
      images: [],
      isPublic: true,
      status: 'upcoming'
    });
    setShowCreateDialog(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleJoinEvent = (event: Event) => {
    if (!context.currentUser) return;

    setEvents(prev => prev.map(e =>
      e.id === event.id
        ? { ...e, currentParticipants: [...e.currentParticipants, context.currentUser.id] }
        : e
    ));
  };

  const isParticipating = (event: Event) => {
    return context.currentUser && event.currentParticipants.includes(context.currentUser.id);
  };

  const canManageEvents = context.currentUser?.type === 'studio_admin' || context.currentUser?.type === 'instructor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Events & Exhibitions</h1>
          <p className="text-muted-foreground">
            Discover pottery events, exhibitions, and opportunities to showcase your work
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">{filteredEvents.length} events</Badge>

          {canManageEvents && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Event</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input
                        id="event-title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Summer Pottery Exhibition"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-type">Event Type</Label>
                      <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exhibition">Exhibition</SelectItem>
                          <SelectItem value="sale">Sale/Market</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="competition">Competition</SelectItem>
                          <SelectItem value="social">Social Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the event, its purpose, and what participants can expect..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date (Optional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event venue or address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-participants">Max Participants</Label>
                      <Input
                        id="max-participants"
                        type="number"
                        value={newEvent.maxParticipants}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="participation-fee">Participation Fee ($)</Label>
                      <Input
                        id="participation-fee"
                        type="number"
                        value={newEvent.pricing?.participationFee}
                        onChange={(e) => setNewEvent(prev => ({
                          ...prev,
                          pricing: { ...prev.pricing!, participationFee: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Public Event</Label>
                      <p className="text-sm text-muted-foreground">Allow non-studio members to participate</p>
                    </div>
                    <Switch
                      checked={newEvent.isPublic}
                      onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, isPublic: checked }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEvent} disabled={!newEvent.title || !newEvent.date}>
                      Create Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search events, organizers, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="exhibition">Exhibitions</SelectItem>
            <SelectItem value="sale">Sales/Markets</SelectItem>
            <SelectItem value="workshop">Workshops</SelectItem>
            <SelectItem value="competition">Competitions</SelectItem>
            <SelectItem value="social">Social Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3>No events found</h3>
            <p className="text-muted-foreground">
              {events.length === 0
                ? 'No pottery events are currently scheduled.'
                : 'Try adjusting your search or filters.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Event Image */}
              {event.images && event.images.length > 0 && (
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    <Badge className={getTypeColor(event.type)} variant="outline">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {event.organizer}
                    </p>
                  </div>
                  {!event.images && (
                    <div className="flex flex-col space-y-1">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Badge className={getTypeColor(event.type)} variant="outline">
                        {event.type}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(event.date).toLocaleDateString()}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  {event.maxParticipants && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.currentParticipants.length}/{event.maxParticipants} participants</span>
                    </div>
                  )}
                  {event.pricing?.participationFee !== undefined && event.pricing.participationFee > 0 && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>${event.pricing.participationFee} participation fee</span>
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {event.requirements && event.requirements.length > 0 && (
                  <div>
                    <Label className="text-xs">Requirements:</Label>
                    <ul className="text-xs text-muted-foreground mt-1">
                      {event.requirements.slice(0, 2).map((req, index) => (
                        <li key={index} className="line-clamp-1">• {req}</li>
                      ))}
                      {event.requirements.length > 2 && (
                        <li>• +{event.requirements.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {isParticipating(event) ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Registered
                    </Badge>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleJoinEvent(event)}
                      disabled={event.maxParticipants && event.currentParticipants.length >= event.maxParticipants}
                    >
                      {event.maxParticipants && event.currentParticipants.length >= event.maxParticipants
                        ? 'Full'
                        : 'Join Event'
                      }
                    </Button>
                  )}

                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>Details</span>
                  </Button>

                  {canManageEvents && event.organizerId === context.currentUser?.id && (
                    <>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center space-x-1 text-destructive">
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{event.title}"? This action cannot be undone and will remove all participant registrations.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Event
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>

                {/* Participation Progress */}
                {event.maxParticipants && (
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Registration</span>
                      <span>{event.currentParticipants.length}/{event.maxParticipants}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(event.currentParticipants.length / event.maxParticipants) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}