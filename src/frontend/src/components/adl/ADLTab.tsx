import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useGetADLRecords } from '../../hooks/useQueries';
import AddADLRecordModal from './modals/AddADLRecordModal';
import type { ResidentId } from '../../backend';

interface ADLTabProps {
  residentId: ResidentId;
  canWrite: boolean;
}

export default function ADLTab({ residentId, canWrite }: ADLTabProps) {
  const { data: adlRecords = [] } = useGetADLRecords(residentId);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🏃</span>
            Activities of Daily Living
          </CardTitle>
          {canWrite && (
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add ADL Record
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {adlRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Assistance Level</TableHead>
                <TableHead>Staff Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adlRecords.map(record => (
                <TableRow key={record.id.toString()}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="font-medium">{record.activity}</TableCell>
                  <TableCell>{record.assistanceLevel}</TableCell>
                  <TableCell>{record.staffNotes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500 py-8">No ADL records found</p>
        )}
      </CardContent>

      {showAddModal && <AddADLRecordModal residentId={residentId} onClose={() => setShowAddModal(false)} />}
    </Card>
  );
}
