import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  type OldResidentId = Nat;
  type OldMedicationId = Nat;

  type OldResponsibleContact = {
    id : Nat;
    name : Text;
    relationship : Text;
    phone : Text;
    email : Text;
    isPrimary : Bool;
  };

  type OldMedication = {
    id : OldMedicationId;
    name : Text;
    dosage : Text;
    dosageQuantity : Text;
    administrationRoute : Text;
    administrationTimes : [Text];
    prescribingPhysicianId : ?Nat;
    notes : Text;
    isActive : Bool;
    isPRN : Bool;
  };

  type OldMARRecord = {
    id : Nat;
    medicationId : OldMedicationId;
    administrationTime : Text;
    administeredBy : Text;
    notes : Text;
    timestamp : Int;
  };

  type OldADLRecord = {
    id : Nat;
    date : Text;
    activity : Text;
    assistanceLevel : Text;
    staffNotes : Text;
    timestamp : Int;
  };

  type OldDailyVitals = {
    id : Nat;
    temperature : Float;
    temperatureUnit : Text;
    bloodPressureSystolic : Nat;
    bloodPressureDiastolic : Nat;
    pulseRate : Nat;
    respiratoryRate : Nat;
    oxygenSaturation : Nat;
    bloodGlucose : ?Nat;
    measurementDate : Text;
    measurementTime : Text;
    notes : Text;
    timestamp : Int;
  };

  type OldPharmacyInfo = {
    name : Text;
    address : Text;
    phone : Text;
    fax : Text;
  };

  type OldInsuranceInfo = {
    provider : Text;
    policyNumber : Text;
    groupNumber : Text;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
  };

  type OldPhysician = {
    id : Nat;
    name : Text;
    specialty : Text;
    contactInfo : Text;
  };

  type ResidentStatus = { #active; #discharged };
  type CodeStatus = { #fullCode; #dnr };

  type OldCodeStatusChangeRecord = {
    id : Nat;
    residentId : OldResidentId;
    previousStatus : CodeStatus;
    newStatus : CodeStatus;
    changedBy : Principal;
    changedByName : Text;
    timestamp : Int;
    notes : Text;
  };

  type OldResident = {
    id : OldResidentId;
    firstName : Text;
    lastName : Text;
    dob : Text;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : Text;
    status : ResidentStatus;
    codeStatus : CodeStatus;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
    physicians : [OldPhysician];
    pharmacyInfo : ?OldPharmacyInfo;
    insuranceInfo : ?OldInsuranceInfo;
    responsibleContacts : [OldResponsibleContact];
    medications : [OldMedication];
    marRecords : [OldMARRecord];
    adlRecords : [OldADLRecord];
    dailyVitals : [OldDailyVitals];
  };

  type UserType = {
    #staff;
    #resident;
    #familyMember;
  };

  type UserProfile = {
    name : Text;
    userType : UserType;
    relatedResidentIds : [Nat];
    showResidentProfileReport : Bool;
  };

  type OldActor = {
    residents : Map.Map<OldResidentId, OldResident>;
    nextResidentId : Nat;
    nextPhysicianId : Nat;
    nextMedicationId : Nat;
    nextContactId : Nat;
    nextMARId : Nat;
    nextADLId : Nat;
    nextVitalsId : Nat;
    nextCodeStatusChangeId : Nat;
    codeStatusChanges : Map.Map<Nat, OldCodeStatusChangeRecord>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewResidentId = OldResidentId;
  type NewMedicationId = OldMedicationId;

  type NewResponsibleContact = {
    id : Nat;
    name : Text;
    relationship : Text;
    phone : Text;
    email : Text;
    isPrimary : Bool;
  };

  type NewMedication = {
    id : NewMedicationId;
    name : Text;
    dosage : Text;
    dosageQuantity : Text;
    administrationRoute : Text;
    administrationTimes : [Text];
    prescribingPhysicianId : ?Nat;
    notes : Text;
    isActive : Bool;
    isPRN : Bool;
  };

  type NewMARRecord = {
    id : Nat;
    medicationId : NewMedicationId;
    administrationTime : Text;
    administeredBy : Text;
    notes : Text;
    timestamp : Int;
  };

  type NewADLRecord = {
    id : Nat;
    date : Text;
    activity : Text;
    assistanceLevel : Text;
    staffNotes : Text;
    timestamp : Int;
  };

  type NewDailyVitals = {
    id : Nat;
    temperature : Float;
    temperatureUnit : Text;
    bloodPressureSystolic : Nat;
    bloodPressureDiastolic : Nat;
    pulseRate : Nat;
    respiratoryRate : Nat;
    oxygenSaturation : Nat;
    bloodGlucose : ?Nat;
    measurementDate : Text;
    measurementTime : Text;
    notes : Text;
    timestamp : Int;
  };

  type NewPharmacyInfo = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    fax : Text;
  };

  type NewInsuranceInfo = {
    id : Nat;
    provider : Text;
    policyNumber : Text;
    groupNumber : Text;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
  };

  type NewPhysician = {
    id : Nat;
    name : Text;
    specialty : Text;
    contactInfo : Text;
  };

  type NewCodeStatusChangeRecord = OldCodeStatusChangeRecord;

  type NewResident = {
    id : NewResidentId;
    firstName : Text;
    lastName : Text;
    dob : Text;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : Text;
    status : ResidentStatus;
    codeStatus : CodeStatus;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
    physicians : [NewPhysician];
    pharmacyInfos : [NewPharmacyInfo];
    insuranceInfos : [NewInsuranceInfo];
    responsibleContacts : [NewResponsibleContact];
    medications : [NewMedication];
    marRecords : [NewMARRecord];
    adlRecords : [NewADLRecord];
    dailyVitals : [NewDailyVitals];
  };

  // Migrate data and add missing IDs.
  public func run(old : OldActor) : {
    residents : Map.Map<NewResidentId, NewResident>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextId : Nat;
    nextMARId : Nat;
    nextADLId : Nat;
    nextVitalsId : Nat;
    nextCodeStatusChangeId : Nat;
    codeStatusChanges : Map.Map<Nat, NewCodeStatusChangeRecord>;
  } {
    var nextId = 0;

    func createId() : Nat {
      let id = nextId;
      nextId += 1;
      id;
    };

    let newResidents = old.residents.map<OldResidentId, OldResident, NewResident>(
      func(_residentId, oldResident) {
        let newMedications = oldResident.medications.map(
          func(oldMedication) {
            let newId = createId();
            { oldMedication with id = newId };
          }
        );

        let pharmacyInfos = switch (oldResident.pharmacyInfo) {
          case (null) { [] };
          case (?oldPharmacy) { [{ oldPharmacy with id = createId() }] };
        };
        let insuranceInfos = switch (oldResident.insuranceInfo) {
          case (null) { [] };
          case (?oldInsurance) { [{ oldInsurance with id = createId() }] };
        };

        {
          oldResident with
          medications = newMedications;
          pharmacyInfos;
          insuranceInfos;
        };
      }
    );

    {
      old with
      residents = newResidents;
      nextId;
    };
  };
};
