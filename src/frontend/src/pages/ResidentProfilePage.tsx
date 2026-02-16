import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Printer, Phone, Mail, Building2, FileText, Pill, Activity, Heart, Plus, Users, Stethoscope } from 'lucide-react';
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
import MedicationSections from '../components/medications/MedicationSections';
import { ResidentStatus, Medication } from '../backend';
import { useDiscontinueMedication, useReactivateMedication } from '../hooks/useQueries';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import CodeStatusBadge from '../components/residents/CodeStatusBadge';
import ResponsiblePersonsSection from '../components/resident-profile/sections/ResponsiblePersonsSection';
import PharmacyInformationSection from '../components/resident-profile/sections/PharmacyInformationSection';
import InsuranceInformationSection from '../components/resident-profile/sections/InsuranceInformationSection';
import PhysicianInformationSection from '../components/resident-profile/sections/PhysicianInformationSection';

type SidebarSection = 'overview' | 'responsible-persons' | 'pharmacy' | 'insurance' | 'physicians';

export default function ResidentProfilePage() {
  const { residentId } = useParams({ from: '/resident/$residentId' });
  const navigate = useNavigate();
  const { data: resident, isLoading } = useGetResident(BigInt(residentId));
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const discontinueMedication = useDiscontinueMedication();
  const reactivateMedication = useReactivateMedication();

  const [selectedSection, setSelectedSection] = useState<SidebarSection>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showEditMedicationModal, setShowEditMedicationModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showAddMARModal, setShowAddMARModal] = useState(false);
  const [showAddADLModal, setShowAddADLModal] = useState(false);
  const [showRecordVitalsModal, setShowRecordVitalsModal] = useState(false);
  const [showPhysicianSignature, setShowPhysicianSignature] = useState(false);

  const canEdit = canWriteClinicalData(userProfile, isAdmin);
  const showProfileReport = userProfile?.showResidentProfileReport ?? true;

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

  const handleReactivateMedication = async (medicationId: bigint) => {
    if (confirm('Are you sure you want to re-activate this medication?')) {
      await reactivateMedication.mutateAsync({ residentId: resident.id, medicationId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'responsible-persons':
        return <ResponsiblePersonsSection resident={resident} canEdit={canEdit} />;
      case 'pharmacy':
        return <PharmacyInformationSection resident={resident} canEdit={canEdit} />;
      case 'insurance':
        return <InsuranceInformationSection resident={resident} canEdit={canEdit} />;
      case 'physicians':
        return <PhysicianInformationSection resident={resident} canEdit={canEdit} />;
      case 'overview':
      default:
        return (
          <>
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
                  {resident.pharmacyInfos.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No pharmacy information</p>
                  ) : (
                    <div className="space-y-4">
                      {resident.pharmacyInfos.map((pharmacy) => (
                        <div key={pharmacy.id.toString()} className="border-b pb-3 last:border-b-0">
                          <p className="font-medium">{pharmacy.name}</p>
                          <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {pharmacy.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">Fax: {pharmacy.fax}</p>
                        </div>
                      ))}
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
                  {resident.insuranceInfos.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No insurance information</p>
                  ) : (
                    <div className="space-y-4">
                      {resident.insuranceInfos.map((insurance) => (
                        <div key={insurance.id.toString()} className="border-b pb-3 last:border-b-0">
                          <div>
                            <p className="text-sm text-muted-foreground">Provider</p>
                            <p className="font-medium">{insurance.provider}</p>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Policy Number</p>
                            <p className="font-medium">{insurance.policyNumber}</p>
                          </div>
                          {insurance.medicareNumber && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Medicare Number</p>
                              <p className="font-medium">{insurance.medicareNumber}</p>
                            </div>
                          )}
                          {insurance.medicaidNumber && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Medicaid Number</p>
                              <p className="font-medium">{insurance.medicaidNumber}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="medications" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="medications">
                  <Pill className="w-4 h-4 mr-2" />
                  Medications
                </TabsTrigger>
                <TabsTrigger value="mar">
                  <FileText className="w-4 h-4 mr-2" />
                  MAR
                </TabsTrigger>
                <TabsTrigger value="vitals">
                  <Heart className="w-4 h-4 mr-2" />
                  Vitals
                </TabsTrigger>
                <TabsTrigger value="adl">
                  <Activity className="w-4 h-4 mr-2" />
                  ADL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="medications">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Medications</CardTitle>
                      {canEdit && (
                        <Button onClick={() => setShowAddMedicationModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Medication
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <MedicationSections
                      medications={resident.medications}
                      canEdit={canEdit}
                      onEditMedication={handleEditMedication}
                      onDiscontinueMedication={handleDiscontinueMedication}
                      onReactivateMedication={handleReactivateMedication}
                      physicians={resident.physicians}
                    />
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
                      <p className="text-center text-muted-foreground py-8">No MAR records found</p>
                    ) : (
                      <div className="space-y-4">
                        {resident.marRecords.map((record) => {
                          const medication = resident.medications.find((m) => m.id === record.medicationId);
                          return (
                            <div key={record.id.toString()} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{medication?.name || 'Unknown Medication'}</p>
                                  <p className="text-sm text-muted-foreground">Administered: {record.administrationTime}</p>
                                  <p className="text-sm text-muted-foreground">By: {record.administeredBy}</p>
                                  {record.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {record.notes}</p>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                      <p className="text-center text-muted-foreground py-8">No vitals recorded</p>
                    ) : (
                      <div className="space-y-4">
                        {resident.dailyVitals.map((vitals) => (
                          <div key={vitals.id.toString()} className="border rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">{vitals.measurementDate}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Temperature</p>
                                <p className="font-medium">
                                  {vitals.temperature}°{vitals.temperatureUnit}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Blood Pressure</p>
                                <p className="font-medium">
                                  {vitals.bloodPressureSystolic.toString()}/{vitals.bloodPressureDiastolic.toString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Pulse</p>
                                <p className="font-medium">{vitals.pulseRate.toString()} bpm</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                                <p className="font-medium">{vitals.respiratoryRate.toString()} /min</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">O2 Saturation</p>
                                <p className="font-medium">{vitals.oxygenSaturation.toString()}%</p>
                              </div>
                              {vitals.bloodGlucose && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Blood Glucose</p>
                                  <p className="font-medium">{vitals.bloodGlucose.toString()} mg/dL</p>
                                </div>
                              )}
                            </div>
                            {vitals.notes && (
                              <div className="mt-4">
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p className="text-sm">{vitals.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
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
                      <p className="text-center text-muted-foreground py-8">No ADL records found</p>
                    ) : (
                      <div className="space-y-4">
                        {resident.adlRecords.map((record) => (
                          <div key={record.id.toString()} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{record.activity}</p>
                                <p className="text-sm text-muted-foreground">Date: {record.date}</p>
                                <p className="text-sm text-muted-foreground">Assistance Level: {record.assistanceLevel}</p>
                                {record.staffNotes && <p className="text-sm text-muted-foreground mt-2">Notes: {record.staffNotes}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        );
    }
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
              <div className="flex gap-3 items-center">
                {showProfileReport && (
                  <>
                    <div
                      className={`
                        flex items-center gap-3 px-5 py-3 rounded-lg border-2 transition-all cursor-pointer
                        ${
                          showPhysicianSignature
                            ? 'bg-primary/10 border-primary shadow-md'
                            : 'bg-muted/50 border-border hover:border-primary/50 hover:bg-muted'
                        }
                      `}
                      onClick={() => setShowPhysicianSignature(!showPhysicianSignature)}
                    >
                      <Switch
                        id="physician-signature"
                        checked={showPhysicianSignature}
                        onCheckedChange={setShowPhysicianSignature}
                        className="physician-signature-switch"
                      />
                      <Label htmlFor="physician-signature" className="text-sm font-semibold cursor-pointer select-none">
                        Show Physician Signature Fields
                      </Label>
                    </div>
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print Profile
                    </Button>
                  </>
                )}
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
                    <p className="text-muted-foreground mt-2">
                      Room {resident.roomNumber} - {resident.bed}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      resident.status === ResidentStatus.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

            <div className="flex gap-6">
              <div className="w-64 flex-shrink-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="flex flex-col">
                      <button
                        onClick={() => setSelectedSection('overview')}
                        className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedSection === 'overview'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Overview</span>
                      </button>
                      <button
                        onClick={() => setSelectedSection('responsible-persons')}
                        className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedSection === 'responsible-persons'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Responsible Persons</span>
                      </button>
                      <button
                        onClick={() => setSelectedSection('pharmacy')}
                        className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedSection === 'pharmacy'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">Pharmacy Information</span>
                      </button>
                      <button
                        onClick={() => setSelectedSection('insurance')}
                        className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedSection === 'insurance'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Insurance Information</span>
                      </button>
                      <button
                        onClick={() => setSelectedSection('physicians')}
                        className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedSection === 'physicians'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span className="font-medium">Physician Information</span>
                      </button>
                    </nav>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1">{renderSectionContent()}</div>
            </div>
          </div>
        </div>

        {showProfileReport && (
          <ResidentProfilePrintReport resident={resident} showPhysicianSignature={showPhysicianSignature} />
        )}
      </div>

      {showEditModal && <EditResidentInformationModal resident={resident} onClose={() => setShowEditModal(false)} />}
      {showAddMedicationModal && (
        <AddMedicationModal residentId={resident.id} physicians={resident.physicians} onClose={() => setShowAddMedicationModal(false)} />
      )}
      {showEditMedicationModal && selectedMedication && (
        <EditMedicationModal
          residentId={resident.id}
          medication={selectedMedication}
          physicians={resident.physicians}
          onClose={() => {
            setShowEditMedicationModal(false);
            setSelectedMedication(null);
          }}
        />
      )}
      {showAddMARModal && (
        <AddMARRecordModal residentId={resident.id} medications={resident.medications} onClose={() => setShowAddMARModal(false)} />
      )}
      {showAddADLModal && <AddADLRecordModal residentId={resident.id} onClose={() => setShowAddADLModal(false)} />}
      {showRecordVitalsModal && <RecordDailyVitalsModal residentId={resident.id} onClose={() => setShowRecordVitalsModal(false)} />}
    </>
  );
}
