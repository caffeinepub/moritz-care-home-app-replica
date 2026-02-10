import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useUpdateResident } from '../../../hooks/useQueries';
import { Resident, Physician, ResidentStatus } from '../../../backend';
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
  const [status, setStatus] = useState<ResidentStatus>(resident.status);
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

    const physiciansList: Physician[] = physicians
      .filter(p => p.name.trim())
      .map((p, i) => ({
        id: p.id || BigInt(Date.now() + i),
        name: p.name,
        specialty: p.specialty,
        contactInfo: p.contactInfo,
      }));

    const updatedResident: Resident = {
      ...resident,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      admissionDate,
      roomNumber,
      roomType,
      bed,
      status: status,
      medicaidNumber: medicaidNumber.trim() || undefined,
      medicareNumber: medicareNumber.trim() || undefined,
      physicians: physiciansList,
      pharmacyInfo: pharmacyName.trim()
        ? {
            name: pharmacyName,
            address: pharmacyAddress,
            phone: pharmacyPhone,
            fax: pharmacyFax,
          }
        : undefined,
    };

    await updateResident.mutateAsync({ residentId: resident.id, updatedData: updatedResident });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
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
                  <Label htmlFor="status">Status</Label>
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
                  <Input value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={pharmacyAddress} onChange={(e) => setPharmacyAddress(e.target.value)} />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input value={pharmacyPhone} onChange={(e) => setPharmacyPhone(e.target.value)} />
                </div>
                <div>
                  <Label>Fax</Label>
                  <Input value={pharmacyFax} onChange={(e) => setPharmacyFax(e.target.value)} />
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={updateResident.isPending} className="bg-blue-600 hover:bg-blue-700">
            {updateResident.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
