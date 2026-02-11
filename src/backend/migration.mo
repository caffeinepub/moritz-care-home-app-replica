import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  public type OldPhysician = {
    id : Nat;
    name : Text;
    specialty : Text;
    contactInfo : Text;
  };

  public type OldPharmacyInfo = {
    name : Text;
    address : Text;
    phone : Text;
    fax : Text;
  };

  public type OldInsuranceInfo = {
    provider : Text;
    policyNumber : Text;
    groupNumber : Text;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
  };

  public type OldResponsibleContact = {
    id : Nat;
    name : Text;
    relationship : Text;
    phone : Text;
    email : Text;
    isPrimary : Bool;
  };

  public type OldMedication = {
    id : Nat;
    name : Text;
    dosage : Text;
    dosageQuantity : Text;
    administrationRoute : Text;
    administrationTimes : [Text];
    prescribingPhysicianId : ?Nat;
    notes : Text;
    isActive : Bool;
  };

  public type OldMARRecord = {
    id : Nat;
    medicationId : Nat;
    administrationTime : Text;
    administeredBy : Text;
    notes : Text;
    timestamp : Int;
  };

  public type OldADLRecord = {
    id : Nat;
    date : Text;
    activity : Text;
    assistanceLevel : Text;
    staffNotes : Text;
    timestamp : Int;
  };

  public type OldDailyVitals = {
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

  public type OldResident = {
    id : Nat;
    firstName : Text;
    lastName : Text;
    dob : Text;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : Text;
    status : { #active; #discharged };
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

  public type OldActor = {
    residents : Map.Map<Nat, OldResident>;
    nextResidentId : Nat;
    nextPhysicianId : Nat;
    nextMedicationId : Nat;
    nextContactId : Nat;
    nextMARId : Nat;
    nextADLId : Nat;
    nextVitalsId : Nat;
  };

  public type NewResident = {
    id : Nat;
    firstName : Text;
    lastName : Text;
    dob : Text;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : Text;
    status : { #active; #discharged };
    codeStatus : { #fullCode; #dnr };
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

  public type NewActor = {
    residents : Map.Map<Nat, NewResident>;
    nextResidentId : Nat;
    nextPhysicianId : Nat;
    nextMedicationId : Nat;
    nextContactId : Nat;
    nextMARId : Nat;
    nextADLId : Nat;
    nextVitalsId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newResidents = old.residents.map<Nat, OldResident, NewResident>(
      func(_id, oldResident) {
        { oldResident with codeStatus = #fullCode };
      }
    );
    {
      old with
      residents = newResidents;
    };
  };
};
