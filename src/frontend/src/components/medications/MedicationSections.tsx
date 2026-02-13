import { Medication } from '../../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RotateCcw } from 'lucide-react';

interface MedicationSectionsProps {
  medications: Medication[];
  canEdit: boolean;
  onAddMedication?: () => void;
  onEditMedication?: (medication: Medication) => void;
  onDiscontinueMedication?: (medicationId: bigint) => void;
  onReactivateMedication?: (medicationId: bigint) => void;
  physicians?: Array<{ id: bigint; name: string }>;
}

export default function MedicationSections({
  medications,
  canEdit,
  onAddMedication,
  onEditMedication,
  onDiscontinueMedication,
  onReactivateMedication,
  physicians = [],
}: MedicationSectionsProps) {
  const activeMedications = medications.filter(m => m.isActive);
  const discontinuedMedications = medications.filter(m => !m.isActive);

  const getPhysicianName = (physicianId?: bigint) => {
    if (!physicianId) return 'Not specified';
    const physician = physicians.find(p => p.id === physicianId);
    return physician ? physician.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Active Medications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Medications</CardTitle>
            {canEdit && onAddMedication && (
              <Button onClick={onAddMedication}>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeMedications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active medications</p>
          ) : (
            <div className="space-y-4">
              {activeMedications.map((medication) => (
                <div key={medication.id.toString()} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-lg">{medication.name}</p>
                        {medication.isPRN && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            PRN
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medication.dosage} - {medication.dosageQuantity}
                      </p>
                    </div>
                    {canEdit && onEditMedication && onDiscontinueMedication && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditMedication(medication)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDiscontinueMedication(medication.id)}
                        >
                          Discontinue
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-medium">{medication.administrationRoute}</p>
                    </div>
                    {!medication.isPRN && medication.administrationTimes.length > 0 && (
                      <div>
                        <p className="text-muted-foreground">Times</p>
                        <p className="font-medium">{medication.administrationTimes.join(', ')}</p>
                      </div>
                    )}
                    {medication.prescribingPhysicianId && (
                      <div>
                        <p className="text-muted-foreground">Prescribing Physician</p>
                        <p className="font-medium">{getPhysicianName(medication.prescribingPhysicianId)}</p>
                      </div>
                    )}
                  </div>
                  {medication.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{medication.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discontinued Medications Section */}
      {discontinuedMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discontinued Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {discontinuedMedications.map((medication) => (
                <div key={medication.id.toString()} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-lg text-muted-foreground">{medication.name}</p>
                        {medication.isPRN && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            PRN
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medication.dosage} - {medication.dosageQuantity}
                      </p>
                    </div>
                    {canEdit && onReactivateMedication && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReactivateMedication(medication.id)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-activate
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-medium text-muted-foreground">{medication.administrationRoute}</p>
                    </div>
                    {!medication.isPRN && medication.administrationTimes.length > 0 && (
                      <div>
                        <p className="text-muted-foreground">Times</p>
                        <p className="font-medium text-muted-foreground">{medication.administrationTimes.join(', ')}</p>
                      </div>
                    )}
                    {medication.prescribingPhysicianId && (
                      <div>
                        <p className="text-muted-foreground">Prescribing Physician</p>
                        <p className="font-medium text-muted-foreground">{getPhysicianName(medication.prescribingPhysicianId)}</p>
                      </div>
                    )}
                  </div>
                  {medication.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm text-muted-foreground">{medication.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
