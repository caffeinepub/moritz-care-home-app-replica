import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateResident } from '../../../hooks/useQueries';
import { Resident, ResidentStatus, CodeStatus } from '../../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResidentProfileEditorBackgroundMode } from '../../../hooks/useResidentProfileEditorBackgroundMode';

interface EditResidentInformationModalProps {
  resident: Resident;
  onClose: () => void;
}

export default function EditResidentInformationModal({ resident, onClose }: EditResidentInformationModalProps) {
  const updateResident = useUpdateResident();
  const { className: modeClassName } = useResidentProfileEditorBackgroundMode();

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

  const firstPharmacy = resident.pharmacyInfos[0];
  const [pharmacyInfo, setPharmacyInfo] = useState(firstPharmacy || {
    name: '',
    address: '',
    phone: '',
    fax: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pharmacyInfos = pharmacyInfo.name ? [{ ...pharmacyInfo, id: firstPharmacy?.id || 0n }] : [];

    const updatedResident: Resident = {
      ...resident,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      admissionDate,
      roomNumber,
      roomType,
      bed,
      status,
      codeStatus,
      medicaidNumber: medicaidNumber.trim() || undefined,
      medicareNumber: medicareNumber.trim() || undefined,
      pharmacyInfos,
    };

    await updateResident.mutateAsync({ residentId: resident.id, updatedData: updatedResident });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] ${modeClassName}`}>
        <DialogHeader>
          <DialogTitle>Edit Resident Information</DialogTitle>
          <DialogDescription>
            Update the resident's information below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input id="admissionDate" type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger id="roomType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shared">Shared</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
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
                  <Select value={status} onValueChange={(value) => setStatus(value as ResidentStatus)}>
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
                  <Select value={codeStatus} onValueChange={(value) => setCodeStatus(value as CodeStatus)}>
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
                  <Input id="medicaidNumber" value={medicaidNumber} onChange={(e) => setMedicaidNumber(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="medicareNumber">Medicare Number</Label>
                  <Input id="medicareNumber" value={medicareNumber} onChange={(e) => setMedicareNumber(e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Pharmacy Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input
                    id="pharmacyName"
                    value={pharmacyInfo.name}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pharmacyAddress">Address</Label>
                  <Textarea
                    id="pharmacyAddress"
                    value={pharmacyInfo.address}
                    onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pharmacyPhone">Phone</Label>
                    <Input
                      id="pharmacyPhone"
                      value={pharmacyInfo.phone}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pharmacyFax">Fax</Label>
                    <Input
                      id="pharmacyFax"
                      value={pharmacyInfo.fax}
                      onChange={(e) => setPharmacyInfo({ ...pharmacyInfo, fax: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={updateResident.isPending}>
            {updateResident.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
