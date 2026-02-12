import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddDailyVitals } from '../../../hooks/useQueries';

interface RecordDailyVitalsModalProps {
  residentId: bigint;
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

    if (
      !temperature ||
      !bloodPressureSystolic ||
      !bloodPressureDiastolic ||
      !pulseRate ||
      !respiratoryRate ||
      !oxygenSaturation ||
      !measurementDate ||
      !measurementTime
    ) {
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
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dialog-solid-white">
        <DialogHeader>
          <DialogTitle>Record Daily Vitals</DialogTitle>
          <DialogDescription>
            Enter the resident's vital signs. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperature">Temperature *</Label>
              <div className="flex gap-2">
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
              <Label htmlFor="bloodPressure">Blood Pressure *</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="bloodPressureSystolic"
                  type="number"
                  value={bloodPressureSystolic}
                  onChange={(e) => setBloodPressureSystolic(e.target.value)}
                  placeholder="120"
                  required
                />
                <span className="text-muted-foreground">/</span>
                <Input
                  id="bloodPressureDiastolic"
                  type="number"
                  value={bloodPressureDiastolic}
                  onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                  placeholder="80"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pulseRate">Pulse Rate (bpm) *</Label>
              <Input
                id="pulseRate"
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(e.target.value)}
                placeholder="72"
                required
              />
            </div>

            <div>
              <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min) *</Label>
              <Input
                id="respiratoryRate"
                type="number"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                placeholder="16"
                required
              />
            </div>

            <div>
              <Label htmlFor="oxygenSaturation">Oxygen Saturation (%) *</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(e.target.value)}
                placeholder="98"
                required
              />
            </div>

            <div>
              <Label htmlFor="bloodGlucose">Blood Glucose (mg/dL)</Label>
              <Input
                id="bloodGlucose"
                type="number"
                value={bloodGlucose}
                onChange={(e) => setBloodGlucose(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="measurementDate">Measurement Date *</Label>
              <Input
                id="measurementDate"
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="measurementTime">Measurement Time *</Label>
              <Input
                id="measurementTime"
                type="time"
                value={measurementTime}
                onChange={(e) => setMeasurementTime(e.target.value)}
                required
              />
            </div>
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
          <Button variant="outline" onClick={onClose} disabled={addDailyVitals.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addDailyVitals.isPending}>
            {addDailyVitals.isPending ? 'Recording...' : 'Record Vitals'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
