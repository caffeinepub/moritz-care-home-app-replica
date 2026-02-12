import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddADLRecord } from '../../../hooks/useQueries';

interface AddADLRecordModalProps {
  residentId: bigint;
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
      staffNotes: staffNotes.trim(),
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md dialog-solid-white">
        <DialogHeader>
          <DialogTitle>Add ADL Record</DialogTitle>
          <DialogDescription>
            Record activities of daily living. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="activity">Activity *</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger id="activity">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bathing">Bathing</SelectItem>
                <SelectItem value="Dressing">Dressing</SelectItem>
                <SelectItem value="Eating">Eating</SelectItem>
                <SelectItem value="Toileting">Toileting</SelectItem>
                <SelectItem value="Transferring">Transferring</SelectItem>
                <SelectItem value="Walking">Walking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assistanceLevel">Assistance Level *</Label>
            <Select value={assistanceLevel} onValueChange={setAssistanceLevel}>
              <SelectTrigger id="assistanceLevel">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Independent">Independent</SelectItem>
                <SelectItem value="Supervision">Supervision</SelectItem>
                <SelectItem value="Minimal Assistance">Minimal Assistance</SelectItem>
                <SelectItem value="Moderate Assistance">Moderate Assistance</SelectItem>
                <SelectItem value="Maximum Assistance">Maximum Assistance</SelectItem>
                <SelectItem value="Total Dependence">Total Dependence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="staffNotes">Staff Notes</Label>
            <Textarea
              id="staffNotes"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={addADLRecord.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addADLRecord.isPending}>
            {addADLRecord.isPending ? 'Adding...' : 'Add Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
