import { Resident, ResidentStatus } from '../../backend';
import CodeStatusBadge from './CodeStatusBadge';
import Logo from '../branding/Logo';

interface ResidentProfilePrintReportProps {
  resident: Resident;
  showPhysicianSignature: boolean;
}

export default function ResidentProfilePrintReport({ resident, showPhysicianSignature }: ResidentProfilePrintReportProps) {
  const activeMedications = resident.medications.filter(m => m.isActive);
  const discontinuedMedications = resident.medications.filter(m => !m.isActive);

  return (
    <div className="print-only">
      <div className="print-page">
        <div className="print-header">
          <div className="flex items-center gap-3 mb-2">
            <Logo variant="header" />
            <div>
              <h1 className="text-2xl font-bold">Resident Profile Report</h1>
              <p className="text-sm text-gray-600">Moritz Care Home</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Resident Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{resident.firstName} {resident.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium">{resident.status === ResidentStatus.active ? 'Active' : 'Discharged'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{resident.dob}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Admission Date</p>
              <p className="font-medium">{resident.admissionDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-medium">Room {resident.roomNumber} - {resident.bed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room Type</p>
              <p className="font-medium">{resident.roomType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Code Status</p>
              <div className="mt-1">
                <CodeStatusBadge codeStatus={resident.codeStatus} />
              </div>
            </div>
            {resident.medicaidNumber && (
              <div>
                <p className="text-sm text-gray-600">Medicaid Number</p>
                <p className="font-medium">{resident.medicaidNumber}</p>
              </div>
            )}
            {resident.medicareNumber && (
              <div>
                <p className="text-sm text-gray-600">Medicare Number</p>
                <p className="font-medium">{resident.medicareNumber}</p>
              </div>
            )}
          </div>
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Physicians</h2>
          {resident.physicians.length === 0 ? (
            <p className="text-gray-600 text-sm">No physicians assigned</p>
          ) : (
            <div className="space-y-3">
              {resident.physicians.map((physician) => (
                <div key={physician.id.toString()} className="border-b pb-2">
                  <p className="font-medium">{physician.name}</p>
                  <p className="text-sm text-gray-600">{physician.specialty}</p>
                  <p className="text-sm text-gray-600">Contact: {physician.contactInfo}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Pharmacy Information</h2>
          {resident.pharmacyInfos.length === 0 ? (
            <p className="text-gray-600 text-sm">No pharmacy information</p>
          ) : (
            <div className="space-y-3">
              {resident.pharmacyInfos.map((pharmacy) => (
                <div key={pharmacy.id.toString()} className="border-b pb-2">
                  <p className="font-medium">{pharmacy.name}</p>
                  <p className="text-sm text-gray-600">{pharmacy.address}</p>
                  <p className="text-sm text-gray-600">Phone: {pharmacy.phone}</p>
                  <p className="text-sm text-gray-600">Fax: {pharmacy.fax}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Responsible Contacts</h2>
          {resident.responsibleContacts.length === 0 ? (
            <p className="text-gray-600 text-sm">No contacts listed</p>
          ) : (
            <div className="space-y-3">
              {resident.responsibleContacts.map((contact) => (
                <div key={contact.id.toString()} className="border-b pb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{contact.name}</p>
                    {contact.isPrimary && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">(Primary)</span>}
                  </div>
                  <p className="text-sm text-gray-600">{contact.relationship}</p>
                  <p className="text-sm text-gray-600">Phone: {contact.phone}</p>
                  <p className="text-sm text-gray-600">Email: {contact.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Insurance Information</h2>
          {resident.insuranceInfos.length === 0 ? (
            <p className="text-gray-600 text-sm">No insurance information</p>
          ) : (
            <div className="space-y-3">
              {resident.insuranceInfos.map((insurance) => (
                <div key={insurance.id.toString()} className="border-b pb-2">
                  <div>
                    <p className="text-sm text-gray-600">Provider</p>
                    <p className="font-medium">{insurance.provider}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Policy Number</p>
                    <p className="font-medium">{insurance.policyNumber}</p>
                  </div>
                  {insurance.medicareNumber && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Medicare Number</p>
                      <p className="font-medium">{insurance.medicareNumber}</p>
                    </div>
                  )}
                  {insurance.medicaidNumber && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Medicaid Number</p>
                      <p className="font-medium">{insurance.medicaidNumber}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="print-page-break"></div>

        <div className="print-section">
          <h2 className="print-section-title">Current Medications</h2>
          {activeMedications.length === 0 ? (
            <p className="text-gray-600 text-sm">No active medications</p>
          ) : (
            <table className="print-medication-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Route</th>
                  <th>Times</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {activeMedications.map((medication) => (
                  <tr key={medication.id.toString()}>
                    <td className="font-medium">{medication.name}</td>
                    <td>{medication.dosage} - {medication.dosageQuantity}</td>
                    <td>{medication.administrationRoute}</td>
                    <td>{medication.administrationTimes.join(', ')}</td>
                    <td className="text-sm">{medication.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {discontinuedMedications.length > 0 && (
          <div className="print-section">
            <h2 className="print-section-title">Discontinued Medications</h2>
            <table className="print-medication-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Route</th>
                  <th>Times</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {discontinuedMedications.map((medication) => (
                  <tr key={medication.id.toString()} className="text-gray-600">
                    <td className="font-medium">{medication.name}</td>
                    <td>{medication.dosage} - {medication.dosageQuantity}</td>
                    <td>{medication.administrationRoute}</td>
                    <td>{medication.administrationTimes.join(', ')}</td>
                    <td className="text-sm">{medication.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showPhysicianSignature && (
          <div className="print-physician-signature-section">
            <div className="print-signature-fields">
              <div className="print-signature-field">
                <p className="text-sm text-gray-600 mb-1">Physician Name:</p>
                <div className="print-signature-line" data-signature-field="name"></div>
              </div>
              <div className="print-signature-field">
                <p className="text-sm text-gray-600 mb-1">Physician Signature:</p>
                <div className="print-signature-line" data-signature-field="signature"></div>
              </div>
              <div className="print-signature-field">
                <p className="text-sm text-gray-600 mb-1">Date:</p>
                <div className="print-signature-line" data-signature-field="date"></div>
              </div>
            </div>
          </div>
        )}

        <div className="print-footer">
          <p className="text-sm text-gray-600">End of Report</p>
        </div>
      </div>
    </div>
  );
}
