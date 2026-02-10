import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddADLRecord } from '../../../hooks/useQueries';
import type { ResidentId } from '../../../backend';

interface AddADLRecordModalProps {
  residentId: ResidentId;
  onClose: () => void;
}

export default function AddADLRecordModal({ residentId, onClose }: AddADLRecordModalProps) {
  const addADLRecord = useAddADLRecord();

  const [date, setDate] = useState('');
  const [activity, setActivity] = useState('');
  const [assistanceLevel, setAssistanceLevel] = useState('');
  const [staffNotes, setStaffNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !activity || !assistanceLevel) {
      alert('Please fill in all required fields');
      return;
    }

    await addADLRecord.mutateAsync({
      residentId,
      date,
      activity,
      assistanceLevel,
      staffNotes,
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add ADL Record</DialogTitle>
          <DialogDescription>Record activities of daily living</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="activity" className="text-sm font-medium">Activity *</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger id="activity" className="mt-1">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bathing">Bathing</SelectItem>
                <SelectItem value="Dressing">Dressing</SelectItem>
                <SelectItem value="Eating">Eating</SelectItem>
                <SelectItem value="Toileting">Toileting</SelectItem>
                <SelectItem value="Transferring">Transferring</SelectItem>
                <SelectItem value="Walking">Walking</SelectItem>
                <SelectItem value="Grooming">Grooming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assistanceLevel" className="text-sm font-medium">Assistance Level *</Label>
            <Select value={assistanceLevel} onValueChange={setAssistanceLevel}>
              <SelectTrigger id="assistanceLevel" className="mt-1">
                <SelectValue placeholder="Select assistance level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Independent">Independent</SelectItem>
                <SelectItem value="Supervision">Supervision</SelectItem>
                <SelectItem value="Minimal Assistance">Minimal Assistance</SelectItem>
                <SelectItem value="Moderate Assistance">Moderate Assistance</SelectItem>
                <SelectItem value="Maximum Assistance">Maximum Assistance</SelectItem>
                <SelectItem value="Total Assistance">Total Assistance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="staffNotes" className="text-sm font-medium">Staff Notes</Label>
            <Textarea
              id="staffNotes"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Any additional observations..."
              rows={3}
              className="mt-1"
            />
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={addADLRecord.isPending} className="bg-blue-600 hover:bg-blue-700">
            {addADLRecord.isPending ? 'Adding...' : 'Add Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
