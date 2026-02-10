import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddMARRecord, useGetMedications } from '../../../hooks/useQueries';
import type { ResidentId } from '../../../backend';

interface AddMARRecordModalProps {
  residentId: ResidentId;
  onClose: () => void;
}

export default function AddMARRecordModal({ residentId, onClose }: AddMARRecordModalProps) {
  const addMARRecord = useAddMARRecord();
  const { data: medications = [] } = useGetMedications(residentId);

  const [medicationId, setMedicationId] = useState('');
  const [administrationTime, setAdministrationTime] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [notes, setNotes] = useState('');

  const activeMedications = medications.filter(m => m.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicationId || !administrationTime || !administeredBy) {
      alert('Please fill in all required fields');
      return;
    }

    await addMARRecord.mutateAsync({
      residentId,
      medicationId: BigInt(medicationId),
      administrationTime,
      administeredBy,
      notes,
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add MAR Record</DialogTitle>
          <DialogDescription>Record medication administration for active medications</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="medicationId" className="text-sm font-medium">Active Medication *</Label>
            <Select value={medicationId} onValueChange={setMedicationId}>
              <SelectTrigger id="medicationId" className="mt-1">
                <SelectValue placeholder="Select active medication" />
              </SelectTrigger>
              <SelectContent>
                {activeMedications.map(med => (
                  <SelectItem key={med.id.toString()} value={med.id.toString()}>
                    {med.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="administrationTime" className="text-sm font-medium">Administration Time *</Label>
            <Input
              id="administrationTime"
              type="datetime-local"
              value={administrationTime}
              onChange={(e) => setAdministrationTime(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="administeredBy" className="text-sm font-medium">Administered By *</Label>
            <Input
              id="administeredBy"
              value={administeredBy}
              onChange={(e) => setAdministeredBy(e.target.value)}
              placeholder="Staff name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="mt-1"
            />
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={addMARRecord.isPending} className="bg-blue-600 hover:bg-blue-700">
            {addMARRecord.isPending ? 'Adding...' : 'Add Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
