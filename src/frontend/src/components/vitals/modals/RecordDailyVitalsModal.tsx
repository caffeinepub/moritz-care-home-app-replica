import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddDailyVitals } from '../../../hooks/useQueries';
import type { ResidentId } from '../../../backend';

interface RecordDailyVitalsModalProps {
  residentId: ResidentId;
  onClose: () => void;
}

export default function RecordDailyVitalsModal({ residentId, onClose }: RecordDailyVitalsModalProps) {
  const addDailyVitals = useAddDailyVitals();

  const [temperature, setTemperature] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState('F');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [measurementDate, setMeasurementDate] = useState('');
  const [measurementTime, setMeasurementTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!temperature || !bloodPressureSystolic || !bloodPressureDiastolic || !pulseRate || !respiratoryRate || !oxygenSaturation || !measurementDate || !measurementTime) {
      alert('Please fill in all required fields');
      return;
    }

    await addDailyVitals.mutateAsync({
      residentId,
      temperature: parseFloat(temperature),
      temperatureUnit,
      bloodPressureSystolic: BigInt(bloodPressureSystolic),
      bloodPressureDiastolic: BigInt(bloodPressureDiastolic),
      pulseRate: BigInt(pulseRate),
      respiratoryRate: BigInt(respiratoryRate),
      oxygenSaturation: BigInt(oxygenSaturation),
      bloodGlucose: bloodGlucose ? BigInt(bloodGlucose) : null,
      measurementDate,
      measurementTime,
      notes,
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Record Daily Vitals</DialogTitle>
          <DialogDescription>
            Enter the resident's vital signs measurements. All fields except Blood Glucose are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature" className="text-sm font-medium">Temperature *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="98.6"
                  required
                  className="flex-1"
                />
                <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">°F</SelectItem>
                    <SelectItem value="C">°C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bloodPressure" className="text-sm font-medium">Blood Pressure *</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  id="bloodPressureSystolic"
                  type="number"
                  value={bloodPressureSystolic}
                  onChange={(e) => setBloodPressureSystolic(e.target.value)}
                  placeholder="120"
                  required
                  className="flex-1"
                />
                <span className="text-gray-500">/</span>
                <Input
                  id="bloodPressureDiastolic"
                  type="number"
                  value={bloodPressureDiastolic}
                  onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                  placeholder="80"
                  required
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pulseRate" className="text-sm font-medium">Pulse Rate (bpm) *</Label>
              <Input
                id="pulseRate"
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(e.target.value)}
                placeholder="72"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="respiratoryRate" className="text-sm font-medium">Respiratory Rate (breaths/min) *</Label>
              <Input
                id="respiratoryRate"
                type="number"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                placeholder="16"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oxygenSaturation" className="text-sm font-medium">Oxygen Saturation (%) *</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(e.target.value)}
                placeholder="98"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bloodGlucose" className="text-sm font-medium">
                Blood Glucose (mg/dL) <span className="text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="bloodGlucose"
                type="number"
                value={bloodGlucose}
                onChange={(e) => setBloodGlucose(e.target.value)}
                placeholder="100"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">For residents requiring diabetes monitoring</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="measurementDate" className="text-sm font-medium">Measurement Date *</Label>
              <Input
                id="measurementDate"
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="measurementTime" className="text-sm font-medium">Measurement Time *</Label>
              <Input
                id="measurementTime"
                type="time"
                value={measurementTime}
                onChange={(e) => setMeasurementTime(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations or notes..."
              rows={3}
              className="mt-1"
            />
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={addDailyVitals.isPending} className="bg-blue-600 hover:bg-blue-700">
            {addDailyVitals.isPending ? 'Recording...' : 'Record Vitals'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
