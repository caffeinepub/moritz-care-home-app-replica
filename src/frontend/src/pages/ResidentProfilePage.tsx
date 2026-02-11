import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Printer, Phone, Mail, Building2, FileText, Pill, Activity, Heart, Plus } from 'lucide-react';
import { useGetResident, useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { canWriteClinicalData } from '../lib/auth/helpers';
import AccessDeniedScreen from '../components/auth/AccessDeniedScreen';
import EditResidentInformationModal from '../components/residents/modals/EditResidentInformationModal';
import AddMedicationModal from '../components/medications/modals/AddMedicationModal';
import EditMedicationModal from '../components/medications/modals/EditMedicationModal';
import AddMARRecordModal from '../components/mar/modals/AddMARRecordModal';
import AddADLRecordModal from '../components/adl/modals/AddADLRecordModal';
import RecordDailyVitalsModal from '../components/vitals/modals/RecordDailyVitalsModal';
import ResidentProfilePrintReport from '../components/residents/ResidentProfilePrintReport';
import { ResidentStatus, Medication } from '../backend';
import { useDiscontinueMedication } from '../hooks/useQueries';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import CodeStatusBadge from '../components/residents/CodeStatusBadge';

export default function ResidentProfilePage() {
  const { residentId } = useParams({ from: '/resident/$residentId' });
  const navigate = useNavigate();
  const { data: resident, isLoading } = useGetResident(BigInt(residentId));
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const discontinueMedication = useDiscontinueMedication();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showEditMedicationModal, setShowEditMedicationModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showAddMARModal, setShowAddMARModal] = useState(false);
  const [showAddADLModal, setShowAddADLModal] = useState(false);
  const [showRecordVitalsModal, setShowRecordVitalsModal] = useState(false);
  const [showPhysicianSignature, setShowPhysicianSignature] = useState(false);

  const canEdit = canWriteClinicalData(userProfile, isAdmin);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading resident profile...</p>
      </div>
    );
  }

  if (!resident) {
    return <AccessDeniedScreen />;
  }

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowEditMedicationModal(true);
  };

  const handleDiscontinueMedication = async (medicationId: bigint) => {
    if (confirm('Are you sure you want to discontinue this medication?')) {
      await discontinueMedication.mutateAsync({ residentId: resident.id, medicationId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-background print:bg-white">
        <div className="no-print">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <Switch
                    id="physician-signature"
                    checked={showPhysicianSignature}
                    onCheckedChange={setShowPhysicianSignature}
                  />
                  <Label htmlFor="physician-signature" className="text-sm cursor-pointer">
                    Show Physician Signature Fields
                  </Label>
                </div>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Profile
                </Button>
                {canEdit && (
                  <Button onClick={() => setShowEditModal(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Information
                  </Button>
                )}
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">
                      {resident.firstName} {resident.lastName}
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">Room {resident.roomNumber} - {resident.bed}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      resident.status === ResidentStatus.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {resident.status === ResidentStatus.active ? 'Active' : 'Discharged'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{resident.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admission Date</p>
                    <p className="font-medium">{resident.admissionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room Type</p>
                    <p className="font-medium">{resident.roomType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Code Status</p>
                    <div className="mt-1">
                      <CodeStatusBadge codeStatus={resident.codeStatus} />
                    </div>
                  </div>
                  {resident.medicaidNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Medicaid Number</p>
                      <p className="font-medium">{resident.medicaidNumber}</p>
                    </div>
                  )}
                  {resident.medicareNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Medicare Number</p>
                      <p className="font-medium">{resident.medicareNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Physicians
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resident.physicians.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No physicians assigned</p>
                  ) : (
                    <div className="space-y-4">
                      {resident.physicians.map((physician) => (
                        <div key={physician.id.toString()} className="border-b pb-3 last:border-b-0">
                          <p className="font-medium">{physician.name}</p>
                          <p className="text-sm text-muted-foreground">{physician.specialty}</p>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {physician.contactInfo}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Pharmacy Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!resident.pharmacyInfo ? (
                    <p className="text-muted-foreground text-sm">No pharmacy information</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium">{resident.pharmacyInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{resident.pharmacyInfo.address}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {resident.pharmacyInfo.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">Fax: {resident.pharmacyInfo.fax}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Responsible Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resident.responsibleContacts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No contacts listed</p>
                  ) : (
                    <div className="space-y-4">
                      {resident.responsibleContacts.map((contact) => (
                        <div key={contact.id.toString()} className="border-b pb-3 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{contact.name}</p>
                            {contact.isPrimary && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Primary</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {contact.phone}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {contact.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!resident.insuranceInfo ? (
                    <p className="text-muted-foreground text-sm">No insurance information</p>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Provider</p>
                        <p className="font-medium">{resident.insuranceInfo.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Policy Number</p>
                        <p className="font-medium">{resident.insuranceInfo.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Group Number</p>
                        <p className="font-medium">{resident.insuranceInfo.groupNumber}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="medications" className="space-y-4">
              <TabsList>
                <TabsTrigger value="medications">
                  <Pill className="w-4 h-4 mr-2" />
                  Medications
                </TabsTrigger>
                <TabsTrigger value="mar">
                  <FileText className="w-4 h-4 mr-2" />
                  MAR
                </TabsTrigger>
                <TabsTrigger value="adl">
                  <Activity className="w-4 h-4 mr-2" />
                  ADL
                </TabsTrigger>
                <TabsTrigger value="vitals">
                  <Heart className="w-4 h-4 mr-2" />
                  Vitals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="medications">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Current Medications</CardTitle>
                      {canEdit && (
                        <Button onClick={() => setShowAddMedicationModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Medication
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resident.medications.filter(m => m.isActive).length === 0 ? (
                      <p className="text-muted-foreground text-sm">No active medications</p>
                    ) : (
                      <div className="space-y-4">
                        {resident.medications
                          .filter(m => m.isActive)
                          .map((medication) => (
                            <div key={medication.id.toString()} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium text-lg">{medication.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {medication.dosage} - {medication.dosageQuantity}
                                  </p>
                                </div>
                                {canEdit && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditMedication(medication)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDiscontinueMedication(medication.id)}
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
                                <div>
                                  <p className="text-muted-foreground">Times</p>
                                  <p className="font-medium">{medication.administrationTimes.join(', ')}</p>
                                </div>
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
              </TabsContent>

              <TabsContent value="mar">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Medication Administration Records</CardTitle>
                      {canEdit && (
                        <Button onClick={() => setShowAddMARModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add MAR Record
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resident.marRecords.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No MAR records</p>
                    ) : (
                      <div className="space-y-3">
                        {resident.marRecords
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((record) => {
                            const medication = resident.medications.find(m => m.id === record.medicationId);
                            return (
                              <div key={record.id.toString()} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{medication?.name || 'Unknown Medication'}</p>
                                    <p className="text-sm text-muted-foreground">{record.administrationTime}</p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(Number(record.timestamp) / 1000000).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm mt-2">Administered by: {record.administeredBy}</p>
                                {record.notes && <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adl">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Activities of Daily Living</CardTitle>
                      {canEdit && (
                        <Button onClick={() => setShowAddADLModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add ADL Record
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resident.adlRecords.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No ADL records</p>
                    ) : (
                      <div className="space-y-3">
                        {resident.adlRecords
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((record) => (
                            <div key={record.id.toString()} className="border rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium">{record.activity}</p>
                                  <p className="text-sm text-muted-foreground">{record.date}</p>
                                </div>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {record.assistanceLevel}
                                </span>
                              </div>
                              {record.staffNotes && (
                                <p className="text-sm text-muted-foreground">{record.staffNotes}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vitals">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Daily Vitals</CardTitle>
                      {canEdit && (
                        <Button onClick={() => setShowRecordVitalsModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Record Vitals
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resident.dailyVitals.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No vitals recorded</p>
                    ) : (
                      <div className="space-y-3">
                        {resident.dailyVitals
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((vitals) => (
                            <div key={vitals.id.toString()} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-medium">{vitals.measurementDate}</p>
                                  <p className="text-sm text-muted-foreground">{vitals.measurementTime}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Temperature</p>
                                  <p className="font-medium">{vitals.temperature}°{vitals.temperatureUnit}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Blood Pressure</p>
                                  <p className="font-medium">{Number(vitals.bloodPressureSystolic)}/{Number(vitals.bloodPressureDiastolic)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Pulse</p>
                                  <p className="font-medium">{Number(vitals.pulseRate)} bpm</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Respiratory Rate</p>
                                  <p className="font-medium">{Number(vitals.respiratoryRate)} /min</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">O2 Saturation</p>
                                  <p className="font-medium">{Number(vitals.oxygenSaturation)}%</p>
                                </div>
                                {vitals.bloodGlucose && (
                                  <div>
                                    <p className="text-muted-foreground">Blood Glucose</p>
                                    <p className="font-medium">{Number(vitals.bloodGlucose)} mg/dL</p>
                                  </div>
                                )}
                              </div>
                              {vitals.notes && (
                                <div className="mt-3">
                                  <p className="text-sm text-muted-foreground">{vitals.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <ResidentProfilePrintReport resident={resident} showPhysicianSignature={showPhysicianSignature} />
      </div>

      {showEditModal && <EditResidentInformationModal resident={resident} onClose={() => setShowEditModal(false)} />}
      {showAddMedicationModal && (
        <AddMedicationModal residentId={resident.id} onClose={() => setShowAddMedicationModal(false)} />
      )}
      {showEditMedicationModal && selectedMedication && (
        <EditMedicationModal
          residentId={resident.id}
          medication={selectedMedication}
          onClose={() => {
            setShowEditMedicationModal(false);
            setSelectedMedication(null);
          }}
        />
      )}
      {showAddMARModal && <AddMARRecordModal residentId={resident.id} onClose={() => setShowAddMARModal(false)} />}
      {showAddADLModal && <AddADLRecordModal residentId={resident.id} onClose={() => setShowAddADLModal(false)} />}
      {showRecordVitalsModal && (
        <RecordDailyVitalsModal residentId={resident.id} onClose={() => setShowRecordVitalsModal(false)} />
      )}
    </>
  );
}
