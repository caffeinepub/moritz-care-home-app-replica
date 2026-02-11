import { Resident, ResidentStatus } from '../../backend';
import CodeStatusBadge from './CodeStatusBadge';

interface ResidentProfilePrintReportProps {
  resident: Resident;
  showPhysicianSignature: boolean;
}

export default function ResidentProfilePrintReport({ resident, showPhysicianSignature }: ResidentProfilePrintReportProps) {
  return (
    <div className="print-only">
      <div className="print-page">
        <div className="print-header">
          <h1 className="text-2xl font-bold">Resident Profile Report</h1>
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
                  {showPhysicianSignature && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-1">Physician Name:</p>
                      <div className="physician-signature-line"></div>
                      <p className="text-sm text-gray-600 mt-3 mb-1">Physician Signature:</p>
                      <div className="physician-signature-line"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Pharmacy Information</h2>
          {!resident.pharmacyInfo ? (
            <p className="text-gray-600 text-sm">No pharmacy information</p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium">{resident.pharmacyInfo.name}</p>
              <p className="text-sm text-gray-600">{resident.pharmacyInfo.address}</p>
              <p className="text-sm text-gray-600">Phone: {resident.pharmacyInfo.phone}</p>
              <p className="text-sm text-gray-600">Fax: {resident.pharmacyInfo.fax}</p>
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
          {!resident.insuranceInfo ? (
            <p className="text-gray-600 text-sm">No insurance information</p>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium">{resident.insuranceInfo.provider}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Policy Number</p>
                <p className="font-medium">{resident.insuranceInfo.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Group Number</p>
                <p className="font-medium">{resident.insuranceInfo.groupNumber}</p>
              </div>
            </div>
          )}
        </div>

        <div className="print-page-break"></div>

        <div className="print-section">
          <h2 className="print-section-title">Current Medications</h2>
          {resident.medications.filter(m => m.isActive).length === 0 ? (
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
                {resident.medications
                  .filter(m => m.isActive)
                  .map((medication) => (
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

        <div className="print-section">
          <h2 className="print-section-title">Recent MAR Records</h2>
          {resident.marRecords.length === 0 ? (
            <p className="text-gray-600 text-sm">No MAR records</p>
          ) : (
            <div className="space-y-2">
              {resident.marRecords
                .sort((a, b) => Number(b.timestamp - a.timestamp))
                .slice(0, 10)
                .map((record) => {
                  const medication = resident.medications.find(m => m.id === record.medicationId);
                  return (
                    <div key={record.id.toString()} className="border-b pb-2 text-sm">
                      <div className="flex justify-between">
                        <p className="font-medium">{medication?.name || 'Unknown'}</p>
                        <p className="text-gray-600">{new Date(Number(record.timestamp) / 1000000).toLocaleDateString()}</p>
                      </div>
                      <p className="text-gray-600">Time: {record.administrationTime}</p>
                      <p className="text-gray-600">By: {record.administeredBy}</p>
                      {record.notes && <p className="text-gray-600">Notes: {record.notes}</p>}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Recent ADL Records</h2>
          {resident.adlRecords.length === 0 ? (
            <p className="text-gray-600 text-sm">No ADL records</p>
          ) : (
            <div className="space-y-2">
              {resident.adlRecords
                .sort((a, b) => Number(b.timestamp - a.timestamp))
                .slice(0, 10)
                .map((record) => (
                  <div key={record.id.toString()} className="border-b pb-2 text-sm">
                    <div className="flex justify-between">
                      <p className="font-medium">{record.activity}</p>
                      <p className="text-gray-600">{record.date}</p>
                    </div>
                    <p className="text-gray-600">Assistance: {record.assistanceLevel}</p>
                    {record.staffNotes && <p className="text-gray-600">Notes: {record.staffNotes}</p>}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="print-section">
          <h2 className="print-section-title">Recent Vitals</h2>
          {resident.dailyVitals.length === 0 ? (
            <p className="text-gray-600 text-sm">No vitals recorded</p>
          ) : (
            <div className="space-y-3">
              {resident.dailyVitals
                .sort((a, b) => Number(b.timestamp - a.timestamp))
                .slice(0, 5)
                .map((vitals) => (
                  <div key={vitals.id.toString()} className="border-b pb-2">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">{vitals.measurementDate}</p>
                      <p className="text-sm text-gray-600">{vitals.measurementTime}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Temp</p>
                        <p>{vitals.temperature}°{vitals.temperatureUnit}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">BP</p>
                        <p>{Number(vitals.bloodPressureSystolic)}/{Number(vitals.bloodPressureDiastolic)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pulse</p>
                        <p>{Number(vitals.pulseRate)} bpm</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Resp</p>
                        <p>{Number(vitals.respiratoryRate)} /min</p>
                      </div>
                      <div>
                        <p className="text-gray-600">O2 Sat</p>
                        <p>{Number(vitals.oxygenSaturation)}%</p>
                      </div>
                      {vitals.bloodGlucose && (
                        <div>
                          <p className="text-gray-600">Glucose</p>
                          <p>{Number(vitals.bloodGlucose)} mg/dL</p>
                        </div>
                      )}
                    </div>
                    {vitals.notes && <p className="text-sm text-gray-600 mt-2">{vitals.notes}</p>}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="print-footer">
          <p className="text-sm text-gray-600">End of Report</p>
        </div>
      </div>
    </div>
  );
}
