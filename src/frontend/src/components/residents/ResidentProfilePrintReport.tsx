import { Resident } from '../../backend';

interface ResidentProfilePrintReportProps {
  resident: Resident;
}

export default function ResidentProfilePrintReport({ resident }: ResidentProfilePrintReportProps) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });

  const age = new Date().getFullYear() - new Date(resident.dob).getFullYear();
  const activeMedications = resident.medications.filter(med => med.isActive);
  const discontinuedMedications = resident.medications.filter(med => !med.isActive);

  const getPhysicianName = (physicianId?: bigint) => {
    if (!physicianId) return 'N/A';
    const physician = resident.physicians.find(p => p.id === physicianId);
    return physician ? physician.name : 'N/A';
  };

  return (
    <div className="print-only hidden print:block">
      {/* Page 1: Demographics and Insurance */}
      <div className="print-page">
        {/* Page Header */}
        <div className="print-page-header">
          <div className="print-page-header-left">{formattedDate} {formattedTime}</div>
          <div className="print-page-header-center">Moritz Care Home Resident Management Application</div>
          <div className="print-page-header-right">1/3</div>
        </div>

        {/* Report Title */}
        <div className="print-report-title">
          <h1>Moritz Care Home</h1>
          <h2>Resident Profile Report</h2>
        </div>

        {/* Resident Information Section */}
        <div className="print-section">
          <h3 className="print-section-header">Resident Information</h3>
          <div className="print-section-divider"></div>
          <div className="print-info-grid">
            <div className="print-info-row">
              <div className="print-info-item">
                <span className="print-label">RESIDENT NAME:</span>
                <span className="print-value">{resident.firstName} {resident.lastName}</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">DATE OF BIRTH:</span>
                <span className="print-value">{resident.dob}</span>
              </div>
            </div>
            <div className="print-info-row">
              <div className="print-info-item">
                <span className="print-label">MEDICAID NUMBER:</span>
                <span className="print-value">{resident.medicaidNumber || resident.insuranceInfo?.medicaidNumber || 'N/A'}</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">MEDICARE NUMBER:</span>
                <span className="print-value">{resident.medicareNumber || resident.insuranceInfo?.medicareNumber || 'N/A'}</span>
              </div>
            </div>
            <div className="print-info-row">
              <div className="print-info-item">
                <span className="print-label">ROOM:</span>
                <span className="print-value">{resident.roomNumber}</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">BED:</span>
                <span className="print-value">{resident.bed}</span>
              </div>
            </div>
            <div className="print-info-row">
              <div className="print-info-item">
                <span className="print-label">AGE:</span>
                <span className="print-value">{age} years</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">DATE OF ADMISSION:</span>
                <span className="print-value">{resident.admissionDate}</span>
              </div>
            </div>
            <div className="print-info-row">
              <div className="print-info-item">
                <span className="print-label">STATUS:</span>
                <span className="print-value">{resident.status === 'active' ? 'Active' : 'Discharged'}</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">RESIDENT ID:</span>
                <span className="print-value">{resident.id.toString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Information Section */}
        <div className="print-section">
          <h3 className="print-section-header">Insurance Information</h3>
          <div className="print-section-divider"></div>
          <div className="print-info-grid">
            <div className="print-info-row">
              <div className="print-info-item">
                <span className="print-label">INSURANCE COMPANY:</span>
                <span className="print-value">{resident.insuranceInfo?.provider || 'N/A'}</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">POLICY NUMBER:</span>
                <span className="print-value">{resident.insuranceInfo?.policyNumber || 'N/A'}</span>
              </div>
            </div>
            <div className="print-info-row">
              <div className="print-info-item">
                <span className="print-label">GROUP NUMBER:</span>
                <span className="print-value">{resident.insuranceInfo?.groupNumber || 'N/A'}</span>
              </div>
              <div className="print-info-item">
                <span className="print-label">MEDICAID NUMBER:</span>
                <span className="print-value">{resident.insuranceInfo?.medicaidNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="print-page-footer">
          Moritz Care Home Resident Long-Term Care Management Application
        </div>
      </div>

      {/* Page 2: Active Medications */}
      <div className="print-page print-page-break-before">
        {/* Page Header */}
        <div className="print-page-header">
          <div className="print-page-header-left">{formattedDate} {formattedTime}</div>
          <div className="print-page-header-center">Moritz Care Home Resident Management Application</div>
          <div className="print-page-header-right">2/3</div>
        </div>

        {/* Active Medications Section */}
        <div className="print-section">
          <h3 className="print-section-header">Active Medications</h3>
          <div className="print-section-divider"></div>
          
          {activeMedications.length > 0 ? (
            <table className="print-medication-table">
              <thead>
                <tr>
                  <th>Medication Name</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Route</th>
                  <th>Times</th>
                  <th>Physician</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {activeMedications.map((med) => (
                  <tr key={med.id.toString()}>
                    <td>{med.name}</td>
                    <td>{med.dosage}</td>
                    <td>{med.dosageQuantity}</td>
                    <td>{med.administrationRoute}</td>
                    <td>{med.administrationTimes.join(', ')}</td>
                    <td>{getPhysicianName(med.prescribingPhysicianId)}</td>
                    <td>{med.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="print-no-data">No active medications</p>
          )}
        </div>

        {/* Discontinued Medications Section */}
        <div className="print-section print-avoid-break">
          <h3 className="print-section-header">Discontinued Medications</h3>
          <div className="print-section-divider"></div>
          
          {discontinuedMedications.length > 0 ? (
            <table className="print-medication-table">
              <thead>
                <tr>
                  <th>Medication Name</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Route</th>
                  <th>Times</th>
                  <th>Physician</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {discontinuedMedications.map((med) => (
                  <tr key={med.id.toString()}>
                    <td>{med.name}</td>
                    <td>{med.dosage}</td>
                    <td>{med.dosageQuantity}</td>
                    <td>{med.administrationRoute}</td>
                    <td>{med.administrationTimes.join(', ')}</td>
                    <td>{getPhysicianName(med.prescribingPhysicianId)}</td>
                    <td>{med.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="print-no-data">No discontinued medications</p>
          )}
        </div>

        {/* Page Footer */}
        <div className="print-page-footer">
          Moritz Care Home Resident Long-Term Care Management Application
        </div>
      </div>

      {/* Page 3: Physicians, Pharmacy, and Contacts */}
      <div className="print-page print-page-break-before">
        {/* Page Header */}
        <div className="print-page-header">
          <div className="print-page-header-left">{formattedDate} {formattedTime}</div>
          <div className="print-page-header-center">Moritz Care Home Resident Management Application</div>
          <div className="print-page-header-right">3/3</div>
        </div>

        {/* Assigned Physicians Section */}
        <div className="print-section">
          <h3 className="print-section-header">Assigned Physicians</h3>
          <div className="print-section-divider"></div>
          
          {resident.physicians.length > 0 ? (
            <div className="print-info-grid">
              {resident.physicians.map((physician) => (
                <div key={physician.id.toString()} className="print-info-row">
                  <div className="print-info-item">
                    <span className="print-label">PHYSICIAN NAME:</span>
                    <span className="print-value">{physician.name}</span>
                  </div>
                  <div className="print-info-item">
                    <span className="print-label">SPECIALTY:</span>
                    <span className="print-value">{physician.specialty}</span>
                  </div>
                  <div className="print-info-item print-full-width">
                    <span className="print-label">CONTACT INFO:</span>
                    <span className="print-value">{physician.contactInfo}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="print-no-data">No assigned physicians</p>
          )}
        </div>

        {/* Pharmacy Information Section */}
        <div className="print-section print-avoid-break">
          <h3 className="print-section-header">Pharmacy Information</h3>
          <div className="print-section-divider"></div>
          
          {resident.pharmacyInfo ? (
            <div className="print-info-grid">
              <div className="print-info-row">
                <div className="print-info-item print-full-width">
                  <span className="print-label">PHARMACY NAME:</span>
                  <span className="print-value">{resident.pharmacyInfo.name}</span>
                </div>
              </div>
              <div className="print-info-row">
                <div className="print-info-item print-full-width">
                  <span className="print-label">ADDRESS:</span>
                  <span className="print-value">{resident.pharmacyInfo.address}</span>
                </div>
              </div>
              <div className="print-info-row">
                <div className="print-info-item">
                  <span className="print-label">PHONE:</span>
                  <span className="print-value">{resident.pharmacyInfo.phone}</span>
                </div>
                <div className="print-info-item">
                  <span className="print-label">FAX:</span>
                  <span className="print-value">{resident.pharmacyInfo.fax}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="print-no-data">No pharmacy information available</p>
          )}
        </div>

        {/* Responsible Contacts Section */}
        <div className="print-section print-avoid-break">
          <h3 className="print-section-header">Responsible Contacts</h3>
          <div className="print-section-divider"></div>
          
          {resident.responsibleContacts.length > 0 ? (
            <div className="print-info-grid">
              {resident.responsibleContacts.map((contact) => (
                <div key={contact.id.toString()} className="print-info-row">
                  <div className="print-info-item">
                    <span className="print-label">NAME:</span>
                    <span className="print-value">{contact.name}{contact.isPrimary ? ' (Primary)' : ''}</span>
                  </div>
                  <div className="print-info-item">
                    <span className="print-label">RELATIONSHIP:</span>
                    <span className="print-value">{contact.relationship}</span>
                  </div>
                  <div className="print-info-item">
                    <span className="print-label">PHONE:</span>
                    <span className="print-value">{contact.phone}</span>
                  </div>
                  <div className="print-info-item">
                    <span className="print-label">EMAIL:</span>
                    <span className="print-value">{contact.email || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="print-no-data">No responsible contacts listed</p>
          )}
        </div>

        {/* Page Footer */}
        <div className="print-page-footer">
          Moritz Care Home Resident Long-Term Care Management Application
        </div>
      </div>
    </div>
  );
}
