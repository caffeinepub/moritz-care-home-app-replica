import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useGetMARRecords, useGetMedications } from '../../hooks/useQueries';
import AddMARRecordModal from './modals/AddMARRecordModal';
import type { ResidentId } from '../../backend';

interface MARTabProps {
  residentId: ResidentId;
  canWrite: boolean;
}

export default function MARTab({ residentId, canWrite }: MARTabProps) {
  const { data: marRecords = [] } = useGetMARRecords(residentId);
  const { data: medications = [] } = useGetMedications(residentId);
  const [showAddModal, setShowAddModal] = useState(false);

  const getMedicationName = (medicationId: bigint) => {
    const medication = medications.find(m => m.id === medicationId);
    return medication?.name || 'Unknown Medication';
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            Medication Administration Records
          </CardTitle>
          {canWrite && (
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add MAR Record
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {marRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Administration Time</TableHead>
                <TableHead>Administered By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marRecords.map(record => (
                <TableRow key={record.id.toString()}>
                  <TableCell className="font-medium">{getMedicationName(record.medicationId)}</TableCell>
                  <TableCell>{record.administrationTime}</TableCell>
                  <TableCell>{record.administeredBy}</TableCell>
                  <TableCell>{record.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500 py-8">No MAR records found</p>
        )}
      </CardContent>

      {showAddModal && <AddMARRecordModal residentId={residentId} onClose={() => setShowAddModal(false)} />}
    </Card>
  );
}
