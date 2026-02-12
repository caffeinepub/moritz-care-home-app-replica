import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddMARRecord } from '../../../hooks/useQueries';
import { Medication } from '../../../backend';

interface AddMARRecordModalProps {
  residentId: bigint;
  medications: Medication[];
  onClose: () => void;
}

export default function AddMARRecordModal({ residentId, medications, onClose }: AddMARRecordModalProps) {
  const addMARRecord = useAddMARRecord();

  const activeMedications = medications.filter(m => m.isActive);

  const [medicationId, setMedicationId] = useState<string>('');
  const [administrationTime, setAdministrationTime] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicationId || !administrationTime.trim() || !administeredBy.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    await addMARRecord.mutateAsync({
      residentId,
      medicationId: BigInt(medicationId),
      administrationTime: administrationTime.trim(),
      administeredBy: administeredBy.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md dialog-solid-white">
        <DialogHeader>
          <DialogTitle>Add MAR Record</DialogTitle>
          <DialogDescription>
            Record medication administration. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="medication">Medication *</Label>
            <Select value={medicationId} onValueChange={setMedicationId}>
              <SelectTrigger id="medication">
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {activeMedications.map((medication) => (
                  <SelectItem key={medication.id.toString()} value={medication.id.toString()}>
                    {medication.name} - {medication.dosage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="administrationTime">Administration Date & Time *</Label>
            <Input
              id="administrationTime"
              type="datetime-local"
              value={administrationTime}
              onChange={(e) => setAdministrationTime(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="administeredBy">Administered By *</Label>
            <Input
              id="administeredBy"
              value={administeredBy}
              onChange={(e) => setAdministeredBy(e.target.value)}
              placeholder="Staff name"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={addMARRecord.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addMARRecord.isPending}>
            {addMARRecord.isPending ? 'Adding...' : 'Add Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
