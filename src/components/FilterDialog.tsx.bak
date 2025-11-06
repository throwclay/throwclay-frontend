import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { PotteryEntry } from '@/app/context/AppContext';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: string;
  typeFilter: string;
  onStatusFilterChange: (status: string) => void;
  onTypeFilterChange: (type: string) => void;
  entries: PotteryEntry[];
}

export function FilterDialog({
  open,
  onOpenChange,
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange,
  entries
}: FilterDialogProps) {
  const uniqueTypes = Array.from(new Set(entries.map(entry => entry.potteryType))).filter(Boolean);

  const clearFilters = () => {
    onStatusFilterChange('all');
    onTypeFilterChange('all');
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Entries</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="fired">Fired</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pottery Type</Label>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}