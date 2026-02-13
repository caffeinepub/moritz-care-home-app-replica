import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUpdateResident } from '../../../hooks/useQueries';
import { Resident, ResidentStatus, CodeStatus } from '../../../backend';

interface EditResidentInformationModalProps {
  resident: Resident;
  onClose: () => void;
}

export default function EditResidentInformationModal({ resident, onClose }: EditResidentInformationModalProps) {
  const updateResident = useUpdateResident();

  const [firstName, setFirstName] = useState(resident.firstName);
  const [lastName, setLastName] = useState(resident.lastName);
  const [dob, setDob] = useState(resident.dob);
  const [admissionDate, setAdmissionDate] = useState(resident.admissionDate);
  const [roomNumber, setRoomNumber] = useState(resident.roomNumber);
  const [roomType, setRoomType] = useState(resident.roomType);
  const [bed, setBed] = useState(resident.bed);
  const [status, setStatus] = useState<ResidentStatus>(resident.status);
  const [codeStatus, setCodeStatus] = useState<CodeStatus>(resident.codeStatus);
  const [medicaidNumber, setMedicaidNumber] = useState(resident.medicaidNumber || '');
  const [medicareNumber, setMedicareNumber] = useState(resident.medicareNumber || '');

  const [physicians, setPhysicians] = useState(resident.physicians);
  const [pharmacyInfo, setPharmacyInfo] = useState(resident.pharmacyInfo || {
    name: '',
    address: '',
    phone: '',
    fax: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !dob || !admissionDate || !roomNumber.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedResident: Resident = {
      ...resident,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      admissionDate,
      roomNumber: roomNumber.trim(),
      roomType,
      bed,
      status,
      codeStatus,
      medicaidNumber: medicaidNumber.trim() || undefined,
      medicareNumber: medicareNumber.trim() || undefined,
      physicians,
      pharmacyInfo: pharmacyInfo.name ? pharmacyInfo : undefined,
    };

    await updateResident.mutateAsync({ residentId: resident.id, updatedData: updatedResident });
    onClose();
  };

  const handlePhysicianChange = (index: number, field: string, value: string) => {
    const updated = [...physicians];
    updated[index] = { ...updated[index], [field]: value };
    setPhysicians(updated);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] dialog-solid-white">
        <DialogHeader>
          <DialogTitle>Edit Resident Information</DialogTitle>
          <DialogDescription>
            Update resident details. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="physicians">Physicians</TabsTrigger>
            <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] pr-4">
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="101"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger id="roomType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Shared">Shared</SelectItem>
                      <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bed">Bed *</Label>
                  <Select value={bed} onValueChange={setBed}>
                    <SelectTrigger id="bed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bed A">Bed A</SelectItem>
                      <SelectItem value="Bed B">Bed B</SelectItem>
                      <SelectItem value="Bed C">Bed C</SelectItem>
                      <SelectItem value="Bed D">Bed D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={(value: ResidentStatus) => setStatus(value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ResidentStatus.active}>Active</SelectItem>
                      <SelectItem value={ResidentStatus.discharged}>Discharged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="codeStatus">Code Status *</Label>
                  <Select value={codeStatus} onValueChange={(value: CodeStatus) => setCodeStatus(value)}>
                    <SelectTrigger id="codeStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CodeStatus.fullCode}>Full Code</SelectItem>
                      <SelectItem value={CodeStatus.dnr}>DNR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="medicaidNumber">Medicaid Number</Label>
                  <Input
                    id="medicaidNumber"
                    value={medicaidNumber}
                    onChange={(e) => setMedicaidNumber(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="medicareNumber">Medicare Number</Label>
                  <Input
                    id="medicareNumber"
                    value={medicareNumber}
                    onChange={(e) => setMedicareNumber(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="physicians" className="space-y-4 mt-4">
              {physicians.map((physician, index) => (
                <div key={physician.id.toString()} className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Physician {index + 1}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={physician.name}
                        onChange={(e) => handlePhysicianChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Specialty</Label>
                      <Input
                        value={physician.specialty}
                        onChange={(e) => handlePhysicianChange(index, 'specialty', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Contact Info</Label>
                      <Input
                        value={physician.contactInfo}
                        onChange={(e) => handlePhysicianChange(index, 'contactInfo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="pharmacy" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input
                    id="pharmacyName"
                    value={pharmacyInfo.name}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, name: e.target.value })}
                    placeholder="CVS Pharmacy"
                  />
                </div>
                <div>
                  <Label htmlFor="pharmacyAddress">Address</Label>
                  <Input
                    id="pharmacyAddress"
                    value={pharmacyInfo.address}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, address: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pharmacyPhone">Phone</Label>
                    <Input
                      id="pharmacyPhone"
                      value={pharmacyInfo.phone}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pharmacyFax">Fax</Label>
                    <Input
                      id="pharmacyFax"
                      value={pharmacyInfo.fax}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, fax: e.target.value })}
                      placeholder="(555) 123-4568"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateResident.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateResident.isPending}>
            {updateResident.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
