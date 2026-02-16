import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useAddResident } from '../../../hooks/useQueries';
import { Resident, Physician, PharmacyInfo, InsuranceInfo, ResponsibleContact, Medication, ResidentStatus, CodeStatus } from '../../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddNewResidentModalProps {
  onClose: () => void;
}

export default function AddNewResidentModal({ onClose }: AddNewResidentModalProps) {
  const addResident = useAddResident();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Shared');
  const [bed, setBed] = useState('Bed A');
  const [codeStatus, setCodeStatus] = useState<CodeStatus>(CodeStatus.fullCode);
  const [medicaidNumber, setMedicaidNumber] = useState('');
  const [medicareNumber, setMedicareNumber] = useState('');

  const [physicians, setPhysicians] = useState<Array<{ name: string; specialty: string; contactInfo: string }>>([]);
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [pharmacyFax, setPharmacyFax] = useState('');

  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');

  const [contacts, setContacts] = useState<Array<{ name: string; relationship: string; phone: string; email: string; isPrimary: boolean }>>([]);
  const [medications, setMedications] = useState<Array<{ name: string; dosage: string; dosageQuantity: string; administrationRoute: string; administrationTimes: string[]; notes: string }>>([]);

  const handleAddPhysician = () => {
    setPhysicians([...physicians, { name: '', specialty: '', contactInfo: '' }]);
  };

  const handleRemovePhysician = (index: number) => {
    setPhysicians(physicians.filter((_, i) => i !== index));
  };

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', relationship: '', phone: '', email: '', isPrimary: false }]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', dosageQuantity: '', administrationRoute: 'Oral', administrationTimes: [''], notes: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleAddAdministrationTime = (medIndex: number) => {
    const updated = [...medications];
    updated[medIndex].administrationTimes.push('');
    setMedications(updated);
  };

  const handleRemoveAdministrationTime = (medIndex: number, timeIndex: number) => {
    const updated = [...medications];
    updated[medIndex].administrationTimes = updated[medIndex].administrationTimes.filter((_, i) => i !== timeIndex);
    setMedications(updated);
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
        id: BigInt(i + 1),
        name: p.name,
        specialty: p.specialty,
        contactInfo: p.contactInfo,
      }));

    const pharmacyInfos: PharmacyInfo[] = pharmacyName.trim()
      ? [{
          id: 0n,
          name: pharmacyName,
          address: pharmacyAddress,
          phone: pharmacyPhone,
          fax: pharmacyFax,
        }]
      : [];

    const insuranceInfos: InsuranceInfo[] = insuranceProvider.trim()
      ? [{
          id: 0n,
          provider: insuranceProvider,
          policyNumber,
          groupNumber,
          medicaidNumber: medicaidNumber.trim() || undefined,
          medicareNumber: medicareNumber.trim() || undefined,
        }]
      : [];

    const contactsList: ResponsibleContact[] = contacts
      .filter(c => c.name.trim())
      .map((c, i) => ({
        id: BigInt(i + 1),
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        email: c.email,
        isPrimary: c.isPrimary,
      }));

    const medicationsList: Medication[] = medications
      .filter(m => m.name.trim())
      .map((m, i) => ({
        id: BigInt(i + 1),
        name: m.name,
        dosage: m.dosage,
        dosageQuantity: m.dosageQuantity,
        administrationRoute: m.administrationRoute,
        administrationTimes: m.administrationTimes.filter(t => t.trim()),
        prescribingPhysicianId: undefined,
        notes: m.notes,
        isActive: true,
        isPRN: false,
      }));

    const residentData: Resident = {
      id: BigInt(0),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      admissionDate,
      roomNumber,
      roomType,
      bed,
      status: ResidentStatus.active,
      codeStatus,
      medicaidNumber: medicaidNumber.trim() || undefined,
      medicareNumber: medicareNumber.trim() || undefined,
      physicians: physiciansList,
      pharmacyInfos,
      insuranceInfos,
      responsibleContacts: contactsList,
      medications: medicationsList,
      marRecords: [],
      adlRecords: [],
      dailyVitals: [],
    };

    await addResident.mutateAsync(residentData);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] dialog-solid-white">
        <DialogHeader>
          <DialogTitle>Add New Resident</DialogTitle>
          <DialogDescription>
            Enter the resident's information below. Fields marked with * are required.
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Physicians</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPhysician}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Physician
                </Button>
              </div>
              {physicians.map((physician, index) => (
                <div key={index} className="border rounded-lg p-4 mb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Physician {index + 1}</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemovePhysician(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
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
                    <div className="col-span-2">
                      <Label>Contact Info</Label>
                      <Input
                        value={physician.contactInfo}
                        onChange={(e) => {
                          const updated = [...physicians];
                          updated[index].contactInfo = e.target.value;
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
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input id="pharmacyName" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="pharmacyAddress">Address</Label>
                  <Textarea id="pharmacyAddress" value={pharmacyAddress} onChange={(e) => setPharmacyAddress(e.target.value)} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="pharmacyPhone">Phone</Label>
                    <Input id="pharmacyPhone" value={pharmacyPhone} onChange={(e) => setPharmacyPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="pharmacyFax">Fax</Label>
                    <Input id="pharmacyFax" value={pharmacyFax} onChange={(e) => setPharmacyFax(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Insurance Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="insuranceProvider">Provider</Label>
                  <Input id="insuranceProvider" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input id="policyNumber" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="groupNumber">Group Number</Label>
                    <Input id="groupNumber" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Responsible Contacts</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contact
                </Button>
              </div>
              {contacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-4 mb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Contact {index + 1}</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveContact(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[index].name = e.target.value;
                          setContacts(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        value={contact.relationship}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[index].relationship = e.target.value;
                          setContacts(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[index].phone = e.target.value;
                          setContacts(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={contact.email}
                        onChange={(e) => {
                          const updated = [...contacts];
                          updated[index].email = e.target.value;
                          setContacts(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Medications</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMedication}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </div>
              {medications.map((medication, medIndex) => (
                <div key={medIndex} className="border rounded-lg p-4 mb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Medication {medIndex + 1}</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMedication(medIndex)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={medication.name}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[medIndex].name = e.target.value;
                          setMedications(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        value={medication.dosage}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[medIndex].dosage = e.target.value;
                          setMedications(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Dosage Quantity</Label>
                      <Input
                        value={medication.dosageQuantity}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[medIndex].dosageQuantity = e.target.value;
                          setMedications(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Route</Label>
                      <Select
                        value={medication.administrationRoute}
                        onValueChange={(value) => {
                          const updated = [...medications];
                          updated[medIndex].administrationRoute = value;
                          setMedications(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oral">Oral</SelectItem>
                          <SelectItem value="IV">IV</SelectItem>
                          <SelectItem value="IM">IM</SelectItem>
                          <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
                          <SelectItem value="Topical">Topical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Administration Times</Label>
                      {medication.administrationTimes.map((time, timeIndex) => (
                        <div key={timeIndex} className="flex gap-2 mb-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const updated = [...medications];
                              updated[medIndex].administrationTimes[timeIndex] = e.target.value;
                              setMedications(updated);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAdministrationTime(medIndex, timeIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAdministrationTime(medIndex)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time
                      </Button>
                    </div>
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={medication.notes}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[medIndex].notes = e.target.value;
                          setMedications(updated);
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={addResident.isPending}>
            {addResident.isPending ? 'Adding...' : 'Add Resident'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
