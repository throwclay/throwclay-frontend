import { useState } from 'react';
import { Users, Palette, Calendar, Settings, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAppContext, type Studio, type FiringSchedule, type User } from '@/app/context/AppContext';

export function AdminDashboard() {
  const context = useAppContext();
  const [showAddGlazeDialog, setShowAddGlazeDialog] = useState(false);
  const [showAddFiringDialog, setShowAddFiringDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newGlaze, setNewGlaze] = useState('');
  const [editingFiring, setEditingFiring] = useState<FiringSchedule | null>(null);

  // Mock members data
  const [members, setMembers] = useState<User[]>([
    {
      id: 'artist1',
      name: 'Jane Potter',
      email: 'jane@studio.com',
      type: 'studio_artist',
      studioId: '1',
      subscription: 'studio',
      profile: {
        bio: 'Ceramic artist specializing in functional pottery',
        socialMedia: { instagram: '@janepotter' }
      }
    },
    {
      id: 'artist2',
      name: 'Mike Clay',
      email: 'mike@studio.com',
      type: 'studio_artist',
      studioId: '1',
      subscription: 'studio',
      profile: {
        bio: 'Sculptor and ceramist exploring abstract forms',
        socialMedia: { website: 'mikeclay.art' }
      }
    }
  ]);

  const [newFiring, setNewFiring] = useState<Omit<FiringSchedule, 'id'>>({
    date: '',
    type: 'Bisque',
    temperature: '1000°C',
    capacity: 20,
    bookedSlots: 0,
    notes: ''
  });

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    type: 'studio_artist' as const
  });

  const handleAddGlaze = () => {
    if (!newGlaze.trim() || !context.currentStudio) return;

    const updatedStudio = {
      ...context.currentStudio,
      glazes: [...context.currentStudio.glazes, newGlaze.trim()]
    };
    context.setCurrentStudio(updatedStudio);
    setNewGlaze('');
    setShowAddGlazeDialog(false);
  };

  const handleRemoveGlaze = (glaze: string) => {
    if (!context.currentStudio) return;

    const updatedStudio = {
      ...context.currentStudio,
      glazes: context.currentStudio.glazes.filter(g => g !== glaze)
    };
    context.setCurrentStudio(updatedStudio);
  };

  const handleAddFiring = () => {
    if (!context.currentStudio) return;

    const firing: FiringSchedule = {
      ...newFiring,
      id: Date.now().toString()
    };

    const updatedStudio = {
      ...context.currentStudio,
      firingSchedule: [...context.currentStudio.firingSchedule, firing]
    };
    context.setCurrentStudio(updatedStudio);
    setNewFiring({
      date: '',
      type: 'Bisque',
      temperature: '1000°C',
      capacity: 20,
      bookedSlots: 0,
      notes: ''
    });
    setShowAddFiringDialog(false);
  };

  const handleDeleteFiring = (firingId: string) => {
    if (!context.currentStudio) return;

    const updatedStudio = {
      ...context.currentStudio,
      firingSchedule: context.currentStudio.firingSchedule.filter(f => f.id !== firingId)
    };
    context.setCurrentStudio(updatedStudio);
  };

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;

    const member: User = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      type: newMember.type,
      studioId: context.currentStudio?.id,
      subscription: 'studio'
    };

    setMembers(prev => [...prev, member]);
    setNewMember({ name: '', email: '', type: 'studio_artist' });
    setShowAddMemberDialog(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleCommissionChange = (newRate: number) => {
    if (!context.currentStudio) return;

    const updatedStudio = {
      ...context.currentStudio,
      commissionRate: newRate
    };
    context.setCurrentStudio(updatedStudio);
  };

  if (!context.currentStudio) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3>No Studio Found</h3>
            <p className="text-muted-foreground">Please contact support to set up your studio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Studio Administration</h1>
          <p className="text-muted-foreground">Manage {context.currentStudio.name}</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          {members.length} Active Members
        </Badge>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="glazes" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Glazes</span>
          </TabsTrigger>
          <TabsTrigger value="firing" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Firing Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="commerce" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Commerce</span>
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2>Studio Members</h2>
            <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="member-name">Name</Label>
                    <Input
                      id="member-name"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Artist name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-email">Email</Label>
                    <Input
                      id="member-email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="artist@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-type">Member Type</Label>
                    <Select value={newMember.type} onValueChange={(value: 'studio_artist') => setNewMember(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio_artist">Studio Artist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember}>
                      Add Member
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.name} from the studio? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{member.type.replace('_', ' ')}</Badge>
                  {member.profile?.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {member.profile.bio}
                    </p>
                  )}
                  {member.profile?.socialMedia && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.profile.socialMedia.instagram && (
                        <Badge variant="secondary" className="text-xs">Instagram</Badge>
                      )}
                      {member.profile.socialMedia.website && (
                        <Badge variant="secondary" className="text-xs">Website</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Glazes Tab */}
        <TabsContent value="glazes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2>Glaze Library</h2>
            <Dialog open={showAddGlazeDialog} onOpenChange={setShowAddGlazeDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Glaze</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Glaze</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="glaze-name">Glaze Name</Label>
                    <Input
                      id="glaze-name"
                      value={newGlaze}
                      onChange={(e) => setNewGlaze(e.target.value)}
                      placeholder="e.g., Celadon, Iron Red"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddGlazeDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGlaze} disabled={!newGlaze.trim()}>
                      Add Glaze
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Glazes ({context.currentStudio.glazes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {context.currentStudio.glazes.map((glaze) => (
                  <div key={glaze} className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
                    <span>{glaze}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGlaze(glaze)}
                      className="p-1 h-auto text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firing Schedule Tab */}
        <TabsContent value="firing" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2>Firing Schedule</h2>
            <Dialog open={showAddFiringDialog} onOpenChange={setShowAddFiringDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Schedule Firing</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Firing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firing-date">Date</Label>
                    <Input
                      id="firing-date"
                      type="date"
                      value={newFiring.date}
                      onChange={(e) => setNewFiring(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firing-type">Type</Label>
                    <Select value={newFiring.type} onValueChange={(value) => setNewFiring(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bisque">Bisque</SelectItem>
                        <SelectItem value="Glaze">Glaze</SelectItem>
                        <SelectItem value="Raku">Raku</SelectItem>
                        <SelectItem value="Pit">Pit Fire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="firing-temp">Temperature</Label>
                    <Input
                      id="firing-temp"
                      value={newFiring.temperature}
                      onChange={(e) => setNewFiring(prev => ({ ...prev, temperature: e.target.value }))}
                      placeholder="e.g., 1000°C"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firing-capacity">Capacity</Label>
                    <Input
                      id="firing-capacity"
                      type="number"
                      value={newFiring.capacity}
                      onChange={(e) => setNewFiring(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="firing-notes">Notes (Optional)</Label>
                    <Textarea
                      id="firing-notes"
                      value={newFiring.notes}
                      onChange={(e) => setNewFiring(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Special instructions or notes..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddFiringDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddFiring}>
                      Schedule Firing
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {context.currentStudio.firingSchedule.map((firing) => (
              <Card key={firing.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{firing.type} Firing</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(firing.date).toLocaleDateString()} • {firing.temperature}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Firing</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this firing? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Firing</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFiring(firing.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Cancel Firing
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capacity:</span>
                      <span>{firing.bookedSlots}/{firing.capacity} slots</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(firing.bookedSlots / firing.capacity) * 100}%`
                        }}
                      />
                    </div>
                    {firing.notes && (
                      <p className="text-sm text-muted-foreground">{firing.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Commerce Tab */}
        <TabsContent value="commerce" className="space-y-6">
          <h2>Commerce Settings</h2>

          <Card>
            <CardHeader>
              <CardTitle>Commission Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="commission-rate">Studio Commission Rate (%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  min="0"
                  max="50"
                  value={context.currentStudio.commissionRate}
                  onChange={(e) => handleCommissionChange(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Percentage of sales that goes to the studio for hosting the marketplace
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4>Commission Breakdown</h4>
                <div className="space-y-2 mt-2 text-sm">
                  <div className="flex justify-between">
                    <span>Artist receives:</span>
                    <span>{100 - context.currentStudio.commissionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Studio commission:</span>
                    <span>{context.currentStudio.commissionRate}%</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t text-sm">
                  <div className="flex justify-between">
                    <span>Example: $100 sale</span>
                    <span>Artist: ${100 - context.currentStudio.commissionRate} | Studio: ${context.currentStudio.commissionRate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketplace Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow member sales</Label>
                  <p className="text-sm text-muted-foreground">Members can list their pottery for sale</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require approval</Label>
                  <p className="text-sm text-muted-foreground">New listings require admin approval</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Studio branding</Label>
                  <p className="text-sm text-muted-foreground">Show studio logo on marketplace</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}