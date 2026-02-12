import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Ban } from 'lucide-react';
import { useGetMedications, useDiscontinueMedication, useGetResident } from '../../hooks/useQueries';
import AddMedicationModal from './modals/AddMedicationModal';
import EditMedicationModal from './modals/EditMedicationModal';
import type { ResidentId, Medication } from '../../backend';

interface MedicationsTabProps {
  residentId: ResidentId;
  canWrite: boolean;
}

export default function MedicationsTab({ residentId, canWrite }: MedicationsTabProps) {
  const { data: medications = [] } = useGetMedications(residentId);
  const { data: resident } = useGetResident(residentId);
  const discontinueMedication = useDiscontinueMedication();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const physicians = resident?.physicians || [];

  const handleDiscontinue = async (medicationId: bigint) => {
    if (confirm('Are you sure you want to discontinue this medication?')) {
      await discontinueMedication.mutateAsync({ residentId, medicationId });
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">💊</span>
            Current Medications
          </CardTitle>
          {canWrite && (
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {medications.length > 0 ? (
          medications.map(medication => (
            <div key={medication.id.toString()} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{medication.name}</h4>
                    <Badge variant={medication.isActive ? 'default' : 'secondary'} className={medication.isActive ? 'bg-green-100 text-green-800' : ''}>
                      {medication.isActive ? 'Active' : 'Discontinued'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Dosage: {medication.dosage} | Quantity: {medication.dosageQuantity}
                  </p>
                  <p className="text-sm text-gray-600">Route: {medication.administrationRoute}</p>
                  {medication.administrationTimes.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Times: {medication.administrationTimes.join(', ')}
                    </p>
                  )}
                  {medication.notes && (
                    <p className="text-sm text-gray-600 mt-2">Notes: {medication.notes}</p>
                  )}
                </div>
                {canWrite && medication.isActive && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingMedication(medication)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDiscontinue(medication.id)}
                      disabled={discontinueMedication.isPending}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Discontinue
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No medications recorded</p>
        )}
      </CardContent>

      {showAddModal && (
        <AddMedicationModal
          residentId={residentId}
          physicians={physicians}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingMedication && (
        <EditMedicationModal
          residentId={residentId}
          medication={editingMedication}
          physicians={physicians}
          onClose={() => setEditingMedication(null)}
        />
      )}
    </Card>
  );
}
