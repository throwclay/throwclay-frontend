import { Calendar, Edit, Trash2, Thermometer, Palette, Wrench, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { PotteryEntry } from '@/app/context/AppContext';

interface EntryCardProps {
  entry: PotteryEntry;
  onEdit: (entry: PotteryEntry) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

export function EntryCard({ entry, onEdit, onDelete, getStatusColor }: EntryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const featuredPhoto = entry.photos[0];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      {/* Featured Photo */}
      {featuredPhoto && (
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={featuredPhoto.url}
            alt={featuredPhoto.caption || entry.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <Badge variant={featuredPhoto.type === 'sketch' ? 'default' : 'secondary'} className="text-xs">
              {featuredPhoto.type === 'sketch' ? 'Sketch' : 'Photo'}
            </Badge>
          </div>
          {entry.photos.length > 1 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                <Camera className="w-3 h-3" />
                <span>+{entry.photos.length - 1}</span>
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="line-clamp-2 mb-2">{entry.title}</h3>
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(entry.date)}
            </div>
            <Badge className={getStatusColor(entry.status)}>
              {entry.status.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry)}
              className="p-2"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{entry.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(entry.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Featured Photo Caption */}
        {featuredPhoto && featuredPhoto.caption && (
          <div>
            <p className="text-sm italic text-muted-foreground">{featuredPhoto.caption}</p>
          </div>
        )}

        {/* Type and Clay */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Type</div>
            <div>{entry.potteryType}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Clay</div>
            <div>{entry.clayType}</div>
          </div>
        </div>

        {/* Techniques */}
        {entry.techniques.length > 0 && (
          <div>
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <Wrench className="w-4 h-4 mr-1" />
              Techniques
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.techniques.slice(0, 3).map(technique => (
                <Badge key={technique} variant="outline" className="text-xs">
                  {technique}
                </Badge>
              ))}
              {entry.techniques.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{entry.techniques.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Firing Info */}
        {(entry.firingType || entry.firingTemp) && (
          <div>
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <Thermometer className="w-4 h-4 mr-1" />
              Firing
            </div>
            <div className="text-sm">
              {entry.firingType}{entry.firingType && entry.firingTemp ? ' • ' : ''}{entry.firingTemp}
            </div>
          </div>
        )}

        {/* Glazes */}
        {entry.glazes.length > 0 && (
          <div>
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <Palette className="w-4 h-4 mr-1" />
              Glazes
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.glazes.slice(0, 3).map(glaze => (
                <Badge key={glaze} variant="outline" className="text-xs">
                  {glaze}
                </Badge>
              ))}
              {entry.glazes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{entry.glazes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Photos Summary */}
        {entry.photos.length > 0 && (
          <div>
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <Camera className="w-4 h-4 mr-1" />
              Documentation
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Badge variant="outline" className="text-xs">
                {entry.photos.filter(p => p.type === 'photo').length} photos
              </Badge>
              {entry.photos.filter(p => p.type === 'sketch').length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {entry.photos.filter(p => p.type === 'sketch').length} sketches
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Notes Preview */}
        {entry.notes && (
          <div>
            <div className="text-muted-foreground text-sm mb-1">Notes</div>
            <p className="text-sm line-clamp-3 text-muted-foreground">
              {entry.notes}
            </p>
          </div>
        )}

        {/* Challenges & Next Steps Preview */}
        <div className="space-y-2">
          {entry.challenges && (
            <div>
              <div className="text-muted-foreground text-xs">Challenges</div>
              <p className="text-xs line-clamp-2 text-muted-foreground">
                {entry.challenges}
              </p>
            </div>
          )}
          {entry.nextSteps && (
            <div>
              <div className="text-muted-foreground text-xs">Next Steps</div>
              <p className="text-xs line-clamp-2 text-muted-foreground">
                {entry.nextSteps}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}