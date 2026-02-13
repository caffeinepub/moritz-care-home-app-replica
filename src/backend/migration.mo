import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldMedication = {
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

  type OldResident = {
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
    physicians : [
      {
        id : Nat;
        name : Text;
        specialty : Text;
        contactInfo : Text;
      }
    ];
    pharmacyInfo : ?{
      name : Text;
      address : Text;
      phone : Text;
      fax : Text;
    };
    insuranceInfo : ?{
      provider : Text;
      policyNumber : Text;
      groupNumber : Text;
      medicaidNumber : ?Text;
      medicareNumber : ?Text;
    };
    responsibleContacts : [
      {
        id : Nat;
        name : Text;
        relationship : Text;
        phone : Text;
        email : Text;
        isPrimary : Bool;
      }
    ];
    medications : [OldMedication];
    marRecords : [
      {
        id : Nat;
        medicationId : Nat;
        administrationTime : Text;
        administeredBy : Text;
        notes : Text;
        timestamp : Int;
      }
    ];
    adlRecords : [
      {
        id : Nat;
        date : Text;
        activity : Text;
        assistanceLevel : Text;
        staffNotes : Text;
        timestamp : Int;
      }
    ];
    dailyVitals : [
      {
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
      }
    ];
  };

  type OldActor = {
    residents : Map.Map<Nat, OldResident>;
  };

  type NewMedication = {
    id : Nat;
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

  type NewResident = {
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
    physicians : [
      {
        id : Nat;
        name : Text;
        specialty : Text;
        contactInfo : Text;
      }
    ];
    pharmacyInfo : ?{
      name : Text;
      address : Text;
      phone : Text;
      fax : Text;
    };
    insuranceInfo : ?{
      provider : Text;
      policyNumber : Text;
      groupNumber : Text;
      medicaidNumber : ?Text;
      medicareNumber : ?Text;
    };
    responsibleContacts : [
      {
        id : Nat;
        name : Text;
        relationship : Text;
        phone : Text;
        email : Text;
        isPrimary : Bool;
      }
    ];
    medications : [NewMedication];
    marRecords : [
      {
        id : Nat;
        medicationId : Nat;
        administrationTime : Text;
        administeredBy : Text;
        notes : Text;
        timestamp : Int;
      }
    ];
    adlRecords : [
      {
        id : Nat;
        date : Text;
        activity : Text;
        assistanceLevel : Text;
        staffNotes : Text;
        timestamp : Int;
      }
    ];
    dailyVitals : [
      {
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
      }
    ];
  };

  type NewActor = {
    residents : Map.Map<Nat, NewResident>;
  };

  public func run(old : OldActor) : NewActor {
    let updatedResidents = old.residents.map<Nat, OldResident, NewResident>(
      func(_id, oldResident) {
        {
          oldResident with
          medications = oldResident.medications.map<OldMedication, NewMedication>(
            func(oldMed) {
              { oldMed with isPRN = false };
            }
          )
        };
      }
    );
    { residents = updatedResidents };
  };
};
