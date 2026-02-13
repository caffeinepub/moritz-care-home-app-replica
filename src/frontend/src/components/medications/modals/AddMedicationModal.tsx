import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { useAddMedication } from '../../../hooks/useQueries';
import { Medication, Physician } from '../../../backend';
import { ADMINISTRATION_ROUTES } from '../administrationRoutes';

interface AddMedicationModalProps {
  residentId: bigint;
  physicians: Physician[];
  onClose: () => void;
}

export default function AddMedicationModal({ residentId, physicians, onClose }: AddMedicationModalProps) {
  const addMedication = useAddMedication();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageQuantity, setDosageQuantity] = useState('');
  const [administrationRoute, setAdministrationRoute] = useState('Oral');
  const [administrationTimes, setAdministrationTimes] = useState<string[]>(['']);
  const [prescribingPhysicianId, setPrescribingPhysicianId] = useState<string>('none');
  const [notes, setNotes] = useState('');
  const [isPRN, setIsPRN] = useState(false);

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

    // When PRN is checked, allow empty administration times
    if (!isPRN && administrationTimes.filter(t => t.trim()).length === 0) {
      alert('Please add at least one administration time or check PRN');
      return;
    }

    const medicationData: Medication = {
      id: BigInt(0),
      name: name.trim(),
      dosage: dosage.trim(),
      dosageQuantity: dosageQuantity.trim(),
      administrationRoute,
      administrationTimes: isPRN ? [] : administrationTimes.filter(t => t.trim()),
      prescribingPhysicianId: prescribingPhysicianId !== 'none' ? BigInt(prescribingPhysicianId) : undefined,
      notes: notes.trim(),
      isActive: true,
      isPRN,
    };

    await addMedication.mutateAsync({ residentId, medicationData });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl dialog-solid-white">
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
          <DialogDescription>
            Enter the medication details below. Fields marked with * are required.
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
                  {ADMINISTRATION_ROUTES.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
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
                <SelectItem value="none">None</SelectItem>
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
              <div className="flex items-center gap-3">
                <Label>Administration Times {!isPRN && '*'}</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isPRN"
                    checked={isPRN}
                    onCheckedChange={(checked) => setIsPRN(checked === true)}
                  />
                  <Label htmlFor="isPRN" className="text-sm font-normal cursor-pointer">
                    PRN (as needed)
                  </Label>
                </div>
              </div>
              {!isPRN && (
                <Button type="button" variant="ghost" size="sm" onClick={handleAddTime}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Time
                </Button>
              )}
            </div>
            {!isPRN && (
              <>
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
                      required={!isPRN}
                    />
                    {administrationTimes.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTime(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </>
            )}
            {isPRN && (
              <p className="text-sm text-muted-foreground">
                This medication will be administered as needed (PRN)
              </p>
            )}
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
          <Button variant="outline" onClick={onClose} disabled={addMedication.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addMedication.isPending}>
            {addMedication.isPending ? 'Adding...' : 'Add Medication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
