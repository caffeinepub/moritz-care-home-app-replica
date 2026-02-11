import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetResident, useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Printer, Edit, Stethoscope, Pill, Phone, FileText } from 'lucide-react';
import { useState } from 'react';
import EditResidentInformationModal from '../components/residents/modals/EditResidentInformationModal';
import MedicationsTab from '../components/medications/MedicationsTab';
import DailyVitalsTab from '../components/vitals/DailyVitalsTab';
import MARTab from '../components/mar/MARTab';
import ADLTab from '../components/adl/ADLTab';
import AccessDeniedScreen from '../components/auth/AccessDeniedScreen';
import ResidentProfilePrintReport from '../components/residents/ResidentProfilePrintReport';
import { isStaffOrAdmin, canAccessResident } from '../lib/auth/helpers';
import { ResidentStatus } from '../backend';

export default function ResidentProfilePage() {
  const { residentId } = useParams({ from: '/resident/$residentId' });
  const navigate = useNavigate();
  const { data: resident, isLoading } = useGetResident(BigInt(residentId));
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const [showEditModal, setShowEditModal] = useState(false);
  const [includePhysicianSignature, setIncludePhysicianSignature] = useState(false);

  const canWrite = isStaffOrAdmin(userProfile, isAdmin);
  const hasAccess = canAccessResident(userProfile, isAdmin, BigInt(residentId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading resident profile...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Resident not found.</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedScreen message="You do not have permission to view this resident's profile." />;
  }

  const age = new Date().getFullYear() - new Date(resident.dob).getFullYear();
  const isActive = resident.status === ResidentStatus.active;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Switch
              id="physician-signature"
              checked={includePhysicianSignature}
              onCheckedChange={setIncludePhysicianSignature}
            />
            <Label htmlFor="physician-signature" className="text-sm font-medium cursor-pointer">
              Include Physician Name & Signature fields in print
            </Label>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {canWrite && (
            <Button onClick={() => setShowEditModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Print-only report */}
      <ResidentProfilePrintReport 
        resident={resident} 
        includePhysicianSignature={includePhysicianSignature}
      />

      {/* Screen-only content */}
      <div className="screen-only">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {resident.firstName} {resident.lastName}
                </CardTitle>
                <p className="text-gray-600 mt-1">Resident Profile</p>
              </div>
              <Badge variant={isActive ? 'default' : 'secondary'} className={`text-base px-4 py-1 ${isActive ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                {isActive ? 'Active' : 'Discharged'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Room Number</p>
                <p className="font-semibold text-gray-900">{resident.roomNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bed</p>
                <p className="font-semibold text-gray-900">{resident.bed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-900">{resident.dob}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold text-gray-900">{age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-semibold text-gray-900">{resident.admissionDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900">{isActive ? 'Active' : 'Discharged'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resident ID</p>
                <p className="font-semibold text-gray-900">{resident.id.toString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Assigned Physicians
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resident.physicians.length > 0 ? (
                resident.physicians.map(physician => (
                  <div key={physician.id.toString()} className="border-l-4 border-blue-500 pl-3 py-1">
                    <p className="font-semibold text-gray-900">{physician.name}</p>
                    <p className="text-sm text-gray-600">{physician.specialty}</p>
                    <p className="text-sm text-gray-600">📞 {physician.contactInfo}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No physicians assigned</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-600" />
                Pharmacy Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resident.pharmacyInfo ? (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{resident.pharmacyInfo.name}</p>
                  <p className="text-sm text-gray-600">{resident.pharmacyInfo.address}</p>
                  <p className="text-sm text-gray-600">📞 {resident.pharmacyInfo.phone}</p>
                  <p className="text-sm text-gray-600">📠 {resident.pharmacyInfo.fax}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No pharmacy information available</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                Responsible Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resident.responsibleContacts.length > 0 ? (
                resident.responsibleContacts.map(contact => (
                  <div key={contact.id.toString()} className="border-l-4 border-purple-500 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{contact.name}</p>
                      {contact.isPrimary && (
                        <Badge variant="outline" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                    <p className="text-sm text-gray-600">📞 {contact.phone}</p>
                    {contact.email && (
                      <p className="text-sm text-gray-600">✉️ {contact.email}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No contacts listed</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Insurance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resident.insuranceInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-semibold text-gray-900">{resident.insuranceInfo.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Policy Number</p>
                  <p className="font-semibold text-gray-900">{resident.insuranceInfo.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Group Number</p>
                  <p className="font-semibold text-gray-900">{resident.insuranceInfo.groupNumber}</p>
                </div>
                {resident.insuranceInfo.medicaidNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Medicaid Number</p>
                    <p className="font-semibold text-gray-900">{resident.insuranceInfo.medicaidNumber}</p>
                  </div>
                )}
                {resident.insuranceInfo.medicareNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Medicare Number</p>
                    <p className="font-semibold text-gray-900">{resident.insuranceInfo.medicareNumber}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No insurance information available</p>
                {resident.medicaidNumber && (
                  <p className="text-sm text-gray-600 mt-2">Medicaid: {resident.medicaidNumber}</p>
                )}
                {resident.medicareNumber && (
                  <p className="text-sm text-gray-600">Medicare: {resident.medicareNumber}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="medications">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="vitals">Daily Vitals</TabsTrigger>
            <TabsTrigger value="mar">MAR</TabsTrigger>
            <TabsTrigger value="adl">ADL</TabsTrigger>
          </TabsList>
          <TabsContent value="medications" className="mt-6">
            <MedicationsTab residentId={resident.id} canWrite={canWrite} />
          </TabsContent>
          <TabsContent value="vitals" className="mt-6">
            <DailyVitalsTab residentId={resident.id} canWrite={canWrite} />
          </TabsContent>
          <TabsContent value="mar" className="mt-6">
            <MARTab residentId={resident.id} canWrite={canWrite} />
          </TabsContent>
          <TabsContent value="adl" className="mt-6">
            <ADLTab residentId={resident.id} canWrite={canWrite} />
          </TabsContent>
        </Tabs>
      </div>

      {showEditModal && <EditResidentInformationModal resident={resident} onClose={() => setShowEditModal(false)} />}
    </div>
  );
}
