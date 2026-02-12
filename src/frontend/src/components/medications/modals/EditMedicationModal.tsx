import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useUpdateMedication } from '../../../hooks/useQueries';
import { Medication, Physician } from '../../../backend';

interface EditMedicationModalProps {
  residentId: bigint;
  medication: Medication;
  physicians: Physician[];
  onClose: () => void;
}

export default function EditMedicationModal({ residentId, medication, physicians, onClose }: EditMedicationModalProps) {
  const updateMedication = useUpdateMedication();

  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [dosageQuantity, setDosageQuantity] = useState(medication.dosageQuantity);
  const [administrationRoute, setAdministrationRoute] = useState(medication.administrationRoute);
  const [administrationTimes, setAdministrationTimes] = useState<string[]>(medication.administrationTimes.length > 0 ? medication.administrationTimes : ['']);
  const [prescribingPhysicianId, setPrescribingPhysicianId] = useState<string>(medication.prescribingPhysicianId?.toString() || '');
  const [notes, setNotes] = useState(medication.notes);

  const handleAddTime = () => {
    setAdministrationTimes([...administrationTimes, '']);
  };

  const handleRemoveTime = (index: number) => {
    setAdministrationTimes(administrationTimes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !dosage.trim() || !dosageQuantity.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedMedication: Medication = {
      ...medication,
      name: name.trim(),
      dosage: dosage.trim(),
      dosageQuantity: dosageQuantity.trim(),
      administrationRoute,
      administrationTimes: administrationTimes.filter(t => t.trim()),
      prescribingPhysicianId: prescribingPhysicianId ? BigInt(prescribingPhysicianId) : undefined,
      notes: notes.trim(),
    };

    await updateMedication.mutateAsync({ residentId, medicationId: medication.id, updatedMedication });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl dialog-solid-white">
        <DialogHeader>
          <DialogTitle>Edit Medication</DialogTitle>
          <DialogDescription>
            Update the medication details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Medication Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aspirin" required />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage *</Label>
              <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="100mg" required />
            </div>
            <div>
              <Label htmlFor="dosageQuantity">Dosage Quantity *</Label>
              <Input id="dosageQuantity" value={dosageQuantity} onChange={(e) => setDosageQuantity(e.target.value)} placeholder="1 tablet" required />
            </div>
            <div>
              <Label htmlFor="administrationRoute">Administration Route *</Label>
              <Select value={administrationRoute} onValueChange={setAdministrationRoute}>
                <SelectTrigger id="administrationRoute">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                  <SelectItem value="IM">IM</SelectItem>
                  <SelectItem value="Topical">Topical</SelectItem>
                  <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="prescribingPhysician">Prescribing Physician</Label>
            <Select value={prescribingPhysicianId} onValueChange={setPrescribingPhysicianId}>
              <SelectTrigger id="prescribingPhysician">
                <SelectValue placeholder="Select physician (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {physicians.map((physician) => (
                  <SelectItem key={physician.id.toString()} value={physician.id.toString()}>
                    {physician.name} - {physician.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Administration Times *</Label>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddTime}>
                <Plus className="w-3 h-3 mr-1" />
                Add Time
              </Button>
            </div>
            {administrationTimes.map((time, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const updated = [...administrationTimes];
                    updated[index] = e.target.value;
                    setAdministrationTimes(updated);
                  }}
                  required
                />
                {administrationTimes.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTime(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
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
          <Button variant="outline" onClick={onClose} disabled={updateMedication.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateMedication.isPending}>
            {updateMedication.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
