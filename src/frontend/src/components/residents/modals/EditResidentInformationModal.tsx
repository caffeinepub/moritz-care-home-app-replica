import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useUpdateResident } from '../../../hooks/useQueries';
import { Resident, Physician, PharmacyInfo, CodeStatus } from '../../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [codeStatus, setCodeStatus] = useState<CodeStatus>(resident.codeStatus);
  const [medicaidNumber, setMedicaidNumber] = useState(resident.medicaidNumber || '');
  const [medicareNumber, setMedicareNumber] = useState(resident.medicareNumber || '');

  const [physicians, setPhysicians] = useState<Array<{ id?: bigint; name: string; specialty: string; contactInfo: string }>>(
    resident.physicians.map(p => ({ id: p.id, name: p.name, specialty: p.specialty, contactInfo: p.contactInfo }))
  );

  const [pharmacyName, setPharmacyName] = useState(resident.pharmacyInfo?.name || '');
  const [pharmacyAddress, setPharmacyAddress] = useState(resident.pharmacyInfo?.address || '');
  const [pharmacyPhone, setPharmacyPhone] = useState(resident.pharmacyInfo?.phone || '');
  const [pharmacyFax, setPharmacyFax] = useState(resident.pharmacyInfo?.fax || '');

  const handleAddPhysician = () => {
    setPhysicians([...physicians, { name: '', specialty: '', contactInfo: '' }]);
  };

  const handleRemovePhysician = (index: number) => {
    setPhysicians(physicians.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !dob || !admissionDate || !roomNumber || !bed) {
      alert('Please fill in all required fields');
      return;
    }

    let nextPhysicianId = Math.max(0, ...resident.physicians.map(p => Number(p.id))) + 1;

    const physiciansList: Physician[] = physicians
      .filter(p => p.name.trim())
      .map((p) => ({
        id: p.id || BigInt(nextPhysicianId++),
        name: p.name,
        specialty: p.specialty,
        contactInfo: p.contactInfo,
      }));

    const pharmacyInfo: PharmacyInfo | undefined = pharmacyName.trim()
      ? {
          name: pharmacyName,
          address: pharmacyAddress,
          phone: pharmacyPhone,
          fax: pharmacyFax,
        }
      : undefined;

    const updatedResident: Resident = {
      ...resident,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      admissionDate,
      roomNumber,
      roomType,
      bed,
      codeStatus,
      medicaidNumber: medicaidNumber.trim() || undefined,
      medicareNumber: medicareNumber.trim() || undefined,
      physicians: physiciansList,
      pharmacyInfo,
    };

    await updateResident.mutateAsync({ residentId: resident.id, updatedData: updatedResident });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] dialog-solid-white">
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
                  <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g., 001" required />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger id="roomType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shared">Shared</SelectItem>
                      <SelectItem value="Solo">Solo</SelectItem>
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
                  <Input id="medicaidNumber" value={medicaidNumber} onChange={(e) => setMedicaidNumber(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <Label htmlFor="medicareNumber">Medicare Number</Label>
                  <Input id="medicareNumber" value={medicareNumber} onChange={(e) => setMedicareNumber(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Physicians</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPhysician}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Physician
                </Button>
              </div>
              {physicians.map((physician, index) => (
                <div key={index} className="border rounded-lg p-4 mb-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemovePhysician(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <p className="text-sm font-medium mb-2">Physician {index + 1}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Physician Name</Label>
                      <Input
                        value={physician.name}
                        onChange={(e) => {
                          const updated = [...physicians];
                          updated[index].name = e.target.value;
                          setPhysicians(updated);
                        }}
                        placeholder="Dr. Smith"
                      />
                    </div>
                    <div>
                      <Label>Contact Number</Label>
                      <Input
                        value={physician.contactInfo}
                        onChange={(e) => {
                          const updated = [...physicians];
                          updated[index].contactInfo = e.target.value;
                          setPhysicians(updated);
                        }}
                        placeholder="555-123-4567"
                      />
                    </div>
                    <div>
                      <Label>Specialty</Label>
                      <Input
                        value={physician.specialty}
                        onChange={(e) => {
                          const updated = [...physicians];
                          updated[index].specialty = e.target.value;
                          setPhysicians(updated);
                        }}
                        placeholder="Cardiology"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Pharmacy Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pharmacy Name</Label>
                  <Input value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} placeholder="CVS Pharmacy" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={pharmacyAddress} onChange={(e) => setPharmacyAddress(e.target.value)} placeholder="123 Main St" />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input value={pharmacyPhone} onChange={(e) => setPharmacyPhone(e.target.value)} placeholder="555-987-6543" />
                </div>
                <div>
                  <Label>Fax</Label>
                  <Input value={pharmacyFax} onChange={(e) => setPharmacyFax(e.target.value)} placeholder="555-987-6544" />
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

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
