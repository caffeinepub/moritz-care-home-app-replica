import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useAddMedication, useGetResident } from '../../../hooks/useQueries';
import type { ResidentId, Medication } from '../../../backend';

interface AddMedicationModalProps {
  residentId: ResidentId;
  onClose: () => void;
}

export default function AddMedicationModal({ residentId, onClose }: AddMedicationModalProps) {
  const addMedication = useAddMedication();
  const { data: resident } = useGetResident(residentId);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageQuantity, setDosageQuantity] = useState('');
  const [administrationRoute, setAdministrationRoute] = useState('Oral');
  const [administrationTimes, setAdministrationTimes] = useState<string[]>(['']);
  const [prescribingPhysicianId, setPrescribingPhysicianId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const physicians = resident?.physicians || [];

  const handleAddTime = () => {
    setAdministrationTimes([...administrationTimes, '']);
  };

  const handleRemoveTime = (index: number) => {
    setAdministrationTimes(administrationTimes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Medication name is required');
      return;
    }

    const medicationData: Medication = {
      id: BigInt(0),
      name: name.trim(),
      dosage: dosage.trim(),
      dosageQuantity: dosageQuantity.trim(),
      administrationRoute,
      administrationTimes: administrationTimes.filter(t => t.trim()),
      prescribingPhysicianId: prescribingPhysicianId ? BigInt(prescribingPhysicianId) : undefined,
      notes: notes.trim(),
      isActive: true,
    };

    await addMedication.mutateAsync({ residentId, medicationData });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Medication</DialogTitle>
          <DialogDescription>Add a new medication for this resident.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Medication Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aspirin"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage" className="text-sm font-medium">Dosage</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 100mg"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dosageQuantity" className="text-sm font-medium">Dosage Quantity</Label>
              <Input
                id="dosageQuantity"
                value={dosageQuantity}
                onChange={(e) => setDosageQuantity(e.target.value)}
                placeholder="e.g., 2 tablets, 5ml, 1 patch"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="administrationRoute" className="text-sm font-medium">Administration Route</Label>
            <Select value={administrationRoute} onValueChange={setAdministrationRoute}>
              <SelectTrigger id="administrationRoute" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oral">Oral</SelectItem>
                <SelectItem value="Injection">Injection</SelectItem>
                <SelectItem value="Topical">Topical</SelectItem>
                <SelectItem value="Inhalation">Inhalation</SelectItem>
                <SelectItem value="Sublingual">Sublingual</SelectItem>
                <SelectItem value="Rectal">Rectal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Administration Times</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTime}>
                <Plus className="w-4 h-4 mr-1" />
                Add Time
              </Button>
            </div>
            <div className="space-y-2">
              {administrationTimes.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={time}
                    onChange={(e) => {
                      const updated = [...administrationTimes];
                      updated[index] = e.target.value;
                      setAdministrationTimes(updated);
                    }}
                    placeholder="e.g., 8:00 AM"
                  />
                  {administrationTimes.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTime(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="prescribingPhysician" className="text-sm font-medium">Prescribing Physician</Label>
            <Select value={prescribingPhysicianId} onValueChange={setPrescribingPhysicianId}>
              <SelectTrigger id="prescribingPhysician" className="mt-1">
                <SelectValue placeholder="Select a physician (optional)" />
              </SelectTrigger>
              <SelectContent>
                {physicians.map(physician => (
                  <SelectItem key={physician.id.toString()} value={physician.id.toString()}>
                    {physician.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional instructions or notes..."
              rows={3}
              className="mt-1"
            />
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={addMedication.isPending} className="bg-blue-600 hover:bg-blue-700">
            {addMedication.isPending ? 'Adding...' : 'Add Medication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
