import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Printer, Phone, Mail, Building2, FileText, Pill, Activity, Heart, Plus, Users, Stethoscope } from 'lucide-react';
import { useGetResident, useGetCallerUserProfile, useIsCallerAdmin, useGetAppSettings } from '../hooks/useQueries';
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
  const { data: appSettings } = useGetAppSettings();
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
  const showProfileReport = appSettings?.displayPreferences.showPrintProfileButton ?? true;

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
                  <Activity className="w-4 h-4 mr-2" />
                  MAR
                </TabsTrigger>
                <TabsTrigger value="adl">
                  <Users className="w-4 h-4 mr-2" />
                  ADL
                </TabsTrigger>
                <TabsTrigger value="vitals">
                  <Heart className="w-4 h-4 mr-2" />
                  Vitals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="medications">
                <MedicationSections
                  medications={resident.medications}
                  canEdit={canEdit}
                  physicians={resident.physicians}
                  onAddMedication={() => setShowAddMedicationModal(true)}
                  onEditMedication={handleEditMedication}
                  onDiscontinueMedication={handleDiscontinueMedication}
                  onReactivateMedication={handleReactivateMedication}
                />
              </TabsContent>

              <TabsContent value="mar">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Medication Administration Records</CardTitle>
                      {canEdit && (
                        <Button onClick={() => setShowAddMARModal(true)} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Record
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
                          .slice()
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((record) => {
                            const medication = resident.medications.find((m) => m.id === record.medicationId);
                            return (
                              <div key={record.id.toString()} className="border-b pb-3 last:border-b-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{medication?.name || 'Unknown Medication'}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Administered: {record.administrationTime}
                                    </p>
                                    <p className="text-sm text-muted-foreground">By: {record.administeredBy}</p>
                                    {record.notes && (
                                      <p className="text-sm text-muted-foreground mt-1">Notes: {record.notes}</p>
                                    )}
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

              <TabsContent value="adl">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Activities of Daily Living</CardTitle>
                      {canEdit && (
                        <Button onClick={() => setShowAddADLModal(true)} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Record
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
                          .slice()
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((record) => (
                            <div key={record.id.toString()} className="border-b pb-3 last:border-b-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{record.activity}</p>
                                  <p className="text-sm text-muted-foreground">Date: {record.date}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Assistance Level: {record.assistanceLevel}
                                  </p>
                                  {record.staffNotes && (
                                    <p className="text-sm text-muted-foreground mt-1">Notes: {record.staffNotes}</p>
                                  )}
                                </div>
                              </div>
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
                        <Button onClick={() => setShowRecordVitalsModal(true)} size="sm">
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
                          .slice()
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((vitals) => (
                            <div key={vitals.id.toString()} className="border-b pb-3 last:border-b-0">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Date/Time</p>
                                  <p className="font-medium">
                                    {vitals.measurementDate} {vitals.measurementTime}
                                  </p>
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
                                <p className="text-sm text-muted-foreground mt-2">Notes: {vitals.notes}</p>
                              )}
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
    <div className="min-h-screen bg-background">
      <div className="no-print container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="outline" onClick={() => setShowEditModal(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Information
              </Button>
            )}
            {showProfileReport && (
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print Profile
              </Button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {resident.firstName} {resident.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span>Room {resident.roomNumber}</span>
                <span>•</span>
                <span>Bed {resident.bed}</span>
                <span>•</span>
                <span className={resident.status === ResidentStatus.active ? 'text-green-600' : 'text-gray-500'}>
                  {resident.status === ResidentStatus.active ? 'Active' : 'Discharged'}
                </span>
              </div>
            </div>
            <CodeStatusBadge codeStatus={resident.codeStatus} />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedSection('overview')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedSection === 'overview'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setSelectedSection('responsible-persons')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedSection === 'responsible-persons'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Responsible Persons
                  </button>
                  <button
                    onClick={() => setSelectedSection('pharmacy')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedSection === 'pharmacy'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Pharmacy Information
                  </button>
                  <button
                    onClick={() => setSelectedSection('insurance')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedSection === 'insurance'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Insurance Information
                  </button>
                  <button
                    onClick={() => setSelectedSection('physicians')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedSection === 'physicians'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 inline mr-2" />
                    Physician Information
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 min-w-0">{renderSectionContent()}</div>
        </div>
      </div>

      {showProfileReport && <ResidentProfilePrintReport resident={resident} showPhysicianSignature={showPhysicianSignature} />}

      {showEditModal && <EditResidentInformationModal resident={resident} onClose={() => setShowEditModal(false)} />}

      {showAddMedicationModal && (
        <AddMedicationModal 
          residentId={resident.id} 
          physicians={resident.physicians}
          onClose={() => setShowAddMedicationModal(false)} 
        />
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
        <AddMARRecordModal
          residentId={resident.id}
          medications={resident.medications}
          onClose={() => setShowAddMARModal(false)}
        />
      )}

      {showAddADLModal && <AddADLRecordModal residentId={resident.id} onClose={() => setShowAddADLModal(false)} />}

      {showRecordVitalsModal && (
        <RecordDailyVitalsModal residentId={resident.id} onClose={() => setShowRecordVitalsModal(false)} />
      )}
    </div>
  );
}
