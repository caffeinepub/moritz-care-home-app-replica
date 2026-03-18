import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Building2,
  Edit,
  FileText,
  Heart,
  Mail,
  Phone,
  Pill,
  Plus,
  Printer,
  Stethoscope,
  Users,
} from "lucide-react";
import { useState } from "react";
import { type Medication, ResidentStatus } from "../backend";
import AddADLRecordModal from "../components/adl/modals/AddADLRecordModal";
import AccessDeniedScreen from "../components/auth/AccessDeniedScreen";
import AddMARRecordModal from "../components/mar/modals/AddMARRecordModal";
import MedicationSections from "../components/medications/MedicationSections";
import AddMedicationModal from "../components/medications/modals/AddMedicationModal";
import EditMedicationModal from "../components/medications/modals/EditMedicationModal";
import InsuranceInformationSection from "../components/resident-profile/sections/InsuranceInformationSection";
import PharmacyInformationSection from "../components/resident-profile/sections/PharmacyInformationSection";
import PhysicianInformationSection from "../components/resident-profile/sections/PhysicianInformationSection";
import ResponsiblePersonsSection from "../components/resident-profile/sections/ResponsiblePersonsSection";
import CodeStatusBadge from "../components/residents/CodeStatusBadge";
import ResidentProfilePrintReport from "../components/residents/ResidentProfilePrintReport";
import EditResidentInformationModal from "../components/residents/modals/EditResidentInformationModal";
import RecordDailyVitalsModal from "../components/vitals/modals/RecordDailyVitalsModal";
import {
  useGetAppSettings,
  useGetCallerUserProfile,
  useGetResident,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import {
  useDiscontinueMedication,
  useReactivateMedication,
} from "../hooks/useQueries";
import { canWriteClinicalData } from "../lib/auth/helpers";

type SidebarSection =
  | "overview"
  | "responsible-persons"
  | "pharmacy"
  | "insurance"
  | "physicians";

export default function ResidentProfilePage() {
  const { residentId } = useParams({ from: "/resident/$residentId" });
  const navigate = useNavigate();
  const { data: resident, isLoading } = useGetResident(BigInt(residentId));
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: appSettings } = useGetAppSettings();
  const discontinueMedication = useDiscontinueMedication();
  const reactivateMedication = useReactivateMedication();

  const [selectedSection, setSelectedSection] =
    useState<SidebarSection>("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showEditMedicationModal, setShowEditMedicationModal] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [showAddMARModal, setShowAddMARModal] = useState(false);
  const [showAddADLModal, setShowAddADLModal] = useState(false);
  const [showRecordVitalsModal, setShowRecordVitalsModal] = useState(false);
  const [showPhysicianSignature, setShowPhysicianSignature] = useState(false);

  const canEdit = canWriteClinicalData(userProfile, isAdmin);
  const showProfileReport =
    appSettings?.displayPreferences.showPrintProfileButton ?? true;

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
    if (confirm("Are you sure you want to discontinue this medication?")) {
      await discontinueMedication.mutateAsync({
        residentId: resident.id,
        medicationId,
      });
    }
  };

  const handleReactivateMedication = async (medicationId: bigint) => {
    if (confirm("Are you sure you want to re-activate this medication?")) {
      await reactivateMedication.mutateAsync({
        residentId: resident.id,
        medicationId,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "responsible-persons":
        return (
          <ResponsiblePersonsSection resident={resident} canEdit={canEdit} />
        );
      case "pharmacy":
        return (
          <PharmacyInformationSection resident={resident} canEdit={canEdit} />
        );
      case "insurance":
        return (
          <InsuranceInformationSection resident={resident} canEdit={canEdit} />
        );
      case "physicians":
        return (
          <PhysicianInformationSection resident={resident} canEdit={canEdit} />
        );
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
                    <p className="text-muted-foreground text-sm">
                      No physicians assigned
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {resident.physicians.map((physician) => (
                        <div
                          key={physician.id.toString()}
                          className="border-b pb-3 last:border-b-0"
                        >
                          <p className="font-medium">{physician.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {physician.specialty}
                          </p>
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
                    <p className="text-muted-foreground text-sm">
                      No pharmacy information
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {resident.pharmacyInfos.map((pharmacy) => (
                        <div
                          key={pharmacy.id.toString()}
                          className="border-b pb-3 last:border-b-0"
                        >
                          <p className="font-medium">{pharmacy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pharmacy.address}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {pharmacy.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Fax: {pharmacy.fax}
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
                    <Phone className="w-5 h-5 mr-2" />
                    Responsible Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resident.responsibleContacts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No contacts listed
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {resident.responsibleContacts.map((contact) => (
                        <div
                          key={contact.id.toString()}
                          className="border-b pb-3 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{contact.name}</p>
                            {contact.isPrimary && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {contact.relationship}
                          </p>
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
                    <p className="text-muted-foreground text-sm">
                      No insurance information
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {resident.insuranceInfos.map((insurance) => (
                        <div
                          key={insurance.id.toString()}
                          className="border-b pb-3 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Provider
                            </p>
                            <p className="font-medium">{insurance.provider}</p>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              Policy Number
                            </p>
                            <p className="font-medium">
                              {insurance.policyNumber}
                            </p>
                          </div>
                          {insurance.medicareNumber && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">
                                Medicare Number
                              </p>
                              <p className="font-medium">
                                {insurance.medicareNumber}
                              </p>
                            </div>
                          )}
                          {insurance.medicaidNumber && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">
                                Medicaid Number
                              </p>
                              <p className="font-medium">
                                {insurance.medicaidNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="medications" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="medications">
                  <Pill className="w-4 h-4 mr-2" />
                  Medications
                </TabsTrigger>
                <TabsTrigger value="adl">
                  <Activity className="w-4 h-4 mr-2" />
                  ADL Records
                </TabsTrigger>
                <TabsTrigger value="vitals">
                  <Heart className="w-4 h-4 mr-2" />
                  Daily Vitals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="medications" className="space-y-4">
                {canEdit && (
                  <Button onClick={() => setShowAddMedicationModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                )}
                <MedicationSections
                  medications={resident.medications}
                  physicians={resident.physicians}
                  onEditMedication={handleEditMedication}
                  onDiscontinueMedication={handleDiscontinueMedication}
                  onReactivateMedication={handleReactivateMedication}
                  canEdit={canEdit}
                />
              </TabsContent>

              <TabsContent value="adl" className="space-y-4">
                {canEdit && (
                  <Button onClick={() => setShowAddADLModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add ADL Record
                  </Button>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Activities of Daily Living</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resident.adlRecords.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No ADL records yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {resident.adlRecords
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((record) => (
                            <div
                              key={record.id.toString()}
                              className="border-b pb-3 last:border-b-0"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {record.activity}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Assistance Level: {record.assistanceLevel}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {record.staffNotes}
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {record.date}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vitals" className="space-y-4">
                {canEdit && (
                  <Button onClick={() => setShowRecordVitalsModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Vitals
                  </Button>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Vital Signs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resident.dailyVitals.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No vitals recorded yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {resident.dailyVitals
                          .sort((a, b) => Number(b.timestamp - a.timestamp))
                          .map((vitals) => (
                            <div
                              key={vitals.id.toString()}
                              className="border-b pb-3 last:border-b-0"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium">
                                  {vitals.measurementDate} at{" "}
                                  {vitals.measurementTime}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Temp:
                                  </span>{" "}
                                  {vitals.temperature}°{vitals.temperatureUnit}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    BP:
                                  </span>{" "}
                                  {vitals.bloodPressureSystolic.toString()}/
                                  {vitals.bloodPressureDiastolic.toString()}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Pulse:
                                  </span>{" "}
                                  {vitals.pulseRate.toString()} bpm
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Resp:
                                  </span>{" "}
                                  {vitals.respiratoryRate.toString()} /min
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    O2 Sat:
                                  </span>{" "}
                                  {vitals.oxygenSaturation.toString()}%
                                </div>
                                {vitals.bloodGlucose && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Glucose:
                                    </span>{" "}
                                    {vitals.bloodGlucose.toString()} mg/dL
                                  </div>
                                )}
                              </div>
                              {vitals.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {vitals.notes}
                                </p>
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
          <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
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
              <Button variant="default" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print Profile
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
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-muted-foreground">
                    Room {resident.roomNumber} - {resident.bed}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      resident.status === ResidentStatus.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {resident.status === ResidentStatus.active
                      ? "Active"
                      : "Discharged"}
                  </span>
                  <CodeStatusBadge codeStatus={resident.codeStatus} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {showProfileReport && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                Print Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center gap-4 rounded-lg border-2 px-4 py-3 transition-colors ${
                  showPhysicianSignature
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Switch
                  id="physician-signature"
                  checked={showPhysicianSignature}
                  onCheckedChange={setShowPhysicianSignature}
                  data-ocid="print.toggle"
                  className="h-7 w-14 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
                />
                <div className="flex flex-col gap-0.5">
                  <Label
                    htmlFor="physician-signature"
                    className="cursor-pointer text-base font-semibold leading-none"
                  >
                    Include Physician Signature Section
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, the printed report will include fields for
                    physician name, signature, and date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={
                    selectedSection === "overview" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedSection("overview")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={
                    selectedSection === "responsible-persons"
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedSection("responsible-persons")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Responsible Persons
                </Button>
                <Button
                  variant={
                    selectedSection === "pharmacy" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedSection("pharmacy")}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Pharmacy
                </Button>
                <Button
                  variant={
                    selectedSection === "insurance" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedSection("insurance")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Insurance
                </Button>
                <Button
                  variant={
                    selectedSection === "physicians" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedSection("physicians")}
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Physicians
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">{renderSectionContent()}</div>
        </div>
      </div>

      {showProfileReport && (
        <ResidentProfilePrintReport
          resident={resident}
          showPhysicianSignature={showPhysicianSignature}
        />
      )}

      {showEditModal && (
        <EditResidentInformationModal
          resident={resident}
          onClose={() => setShowEditModal(false)}
        />
      )}

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

      {showAddADLModal && (
        <AddADLRecordModal
          residentId={resident.id}
          onClose={() => setShowAddADLModal(false)}
        />
      )}

      {showRecordVitalsModal && (
        <RecordDailyVitalsModal
          residentId={resident.id}
          onClose={() => setShowRecordVitalsModal(false)}
        />
      )}
    </div>
  );
}
