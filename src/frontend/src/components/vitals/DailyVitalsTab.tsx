import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useGetDailyVitals } from '../../hooks/useQueries';
import RecordDailyVitalsModal from './modals/RecordDailyVitalsModal';
import type { ResidentId } from '../../backend';

interface DailyVitalsTabProps {
  residentId: ResidentId;
  canWrite: boolean;
}

export default function DailyVitalsTab({ residentId, canWrite }: DailyVitalsTabProps) {
  const { data: vitals = [] } = useGetDailyVitals(residentId);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            Daily Vitals
          </CardTitle>
          {canWrite && (
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Record Daily Vitals
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {vitals.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Blood Pressure</TableHead>
                <TableHead>Pulse</TableHead>
                <TableHead>Respiratory Rate</TableHead>
                <TableHead>O2 Saturation</TableHead>
                <TableHead>Blood Glucose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitals.map(vital => (
                <TableRow key={vital.id.toString()}>
                  <TableCell>
                    {vital.measurementDate} {vital.measurementTime}
                  </TableCell>
                  <TableCell>
                    {vital.temperature}°{vital.temperatureUnit}
                  </TableCell>
                  <TableCell>
                    {vital.bloodPressureSystolic.toString()}/{vital.bloodPressureDiastolic.toString()}
                  </TableCell>
                  <TableCell>{vital.pulseRate.toString()} bpm</TableCell>
                  <TableCell>{vital.respiratoryRate.toString()} breaths/min</TableCell>
                  <TableCell>{vital.oxygenSaturation.toString()}%</TableCell>
                  <TableCell>{vital.bloodGlucose ? `${vital.bloodGlucose.toString()} mg/dL` : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500 py-8">No vitals recorded</p>
        )}
      </CardContent>

      {showAddModal && <RecordDailyVitalsModal residentId={residentId} onClose={() => setShowAddModal(false)} />}
    </Card>
  );
}
