import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Types
  public type UserType = {
    #staff;
    #resident;
    #familyMember;
  };

  public type UserProfile = {
    name : Text;
    userType : UserType;
    relatedResidentIds : [Nat]; // For residents and family members
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Resident Types
  public type ResidentId = Nat;
  public type ResidentStatus = { #active; #discharged };

  public type Physician = {
    id : Nat;
    name : Text;
    specialty : Text;
    contactInfo : Text;
  };

  public type PharmacyInfo = {
    name : Text;
    address : Text;
    phone : Text;
    fax : Text;
  };

  public type InsuranceInfo = {
    provider : Text;
    policyNumber : Text;
    groupNumber : Text;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
  };

  public type ResponsibleContact = {
    id : Nat;
    name : Text;
    relationship : Text;
    phone : Text;
    email : Text;
    isPrimary : Bool;
  };

  public type Medication = {
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

  public type MARRecord = {
    id : Nat;
    medicationId : Nat;
    administrationTime : Text;
    administeredBy : Text;
    notes : Text;
    timestamp : Int;
  };

  public type ADLRecord = {
    id : Nat;
    date : Text;
    activity : Text;
    assistanceLevel : Text;
    staffNotes : Text;
    timestamp : Int;
  };

  public type DailyVitals = {
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

  public type Resident = {
    id : ResidentId;
    firstName : Text;
    lastName : Text;
    dob : Text;
    admissionDate : Text;
    roomNumber : Text;
    roomType : Text;
    bed : Text;
    status : ResidentStatus;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
    physicians : [Physician];
    pharmacyInfo : ?PharmacyInfo;
    insuranceInfo : ?InsuranceInfo;
    responsibleContacts : [ResponsibleContact];
    medications : [Medication];
    marRecords : [MARRecord];
    adlRecords : [ADLRecord];
    dailyVitals : [DailyVitals];
  };

  // Internal State
  let residents = Map.empty<ResidentId, Resident>();
  var nextResidentId = 1;
  var nextPhysicianId = 1;
  var nextMedicationId = 1;
  var nextContactId = 1;
  var nextMARId = 1;
  var nextADLId = 1;
  var nextVitalsId = 1;

  // Authorization Helper Functions
  func isStaffOrAdmin(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.userType) {
          case (#staff) { true };
          case (_) { false };
        };
      };
    };
  };

  func canAccessResident(caller : Principal, residentId : ResidentId) : Bool {
    // Admins and staff can access all residents
    if (isStaffOrAdmin(caller)) {
      return true;
    };

    // Check if user is the resident or a family member
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.relatedResidentIds.any(func(id) { id == residentId });
      };
    };
  };

  module Resident {
    public func compareByLastName(a : Resident, b : Resident) : Order.Order {
      Text.compare(a.lastName, b.lastName);
    };
  };

  // Resident CRUD Operations
  public shared ({ caller }) func addResident(residentData : Resident) : async ResidentId {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add residents");
    };

    let residentId = nextResidentId;
    nextResidentId += 1;

    let newResident : Resident = {
      residentData with
      id = residentId;
    };

    residents.add(residentId, newResident);
    residentId;
  };

  public query ({ caller }) func getResident(residentId : ResidentId) : async ?Resident {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's information");
    };

    residents.get(residentId);
  };

  public query ({ caller }) func getAllResidents() : async [Resident] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only staff and admins can see all residents
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff and admins can view all residents");
    };

    residents.values().toArray();
  };

  public shared ({ caller }) func updateResident(residentId : ResidentId, updatedData : Resident) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update residents");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?_) {
        residents.add(residentId, updatedData);
      };
    };
  };

  public shared ({ caller }) func deleteResident(residentId : ResidentId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete residents");
    };

    residents.remove(residentId);
  };

  public shared ({ caller }) func dischargeResident(residentId : ResidentId) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can discharge residents");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedResident = { resident with status = #discharged };
        residents.add(residentId, updatedResident);
      };
    };
  };

  public query ({ caller }) func getResidentsByFilter(roomNumber : ?Text, status : ?ResidentStatus) : async [Resident] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only staff and admins can filter all residents
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff and admins can filter residents");
    };

    let filtered = residents.values().toArray().filter(
      func(resident) {
        let roomMatch = switch (roomNumber) {
          case (null) { true };
          case (?room) { resident.roomNumber == room };
        };
        let statusMatch = switch (status) {
          case (null) { true };
          case (?s) { resident.status == s };
        };
        roomMatch and statusMatch;
      }
    );

    filtered;
  };

  public query ({ caller }) func getResidentStats() : async { totalResidents : Nat; activeResidents : Nat; dischargedResidents : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff and admins can view statistics");
    };

    var total = 0;
    var active = 0;
    var discharged = 0;

    for (resident in residents.values()) {
      total += 1;
      switch (resident.status) {
        case (#active) { active += 1 };
        case (#discharged) { discharged += 1 };
      };
    };

    { totalResidents = total; activeResidents = active; dischargedResidents = discharged };
  };

  // Physician Management
  public shared ({ caller }) func addPhysicianToResident(residentId : ResidentId, name : Text, specialty : Text, contactInfo : Text) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add physicians");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let physicianId = nextPhysicianId;
        nextPhysicianId += 1;

        let physician : Physician = {
          id = physicianId;
          name;
          specialty;
          contactInfo;
        };

        let updatedPhysicians = resident.physicians.concat([physician]);
        let updatedResident = { resident with physicians = updatedPhysicians };

        residents.add(residentId, updatedResident);
        physicianId;
      };
    };
  };

  public shared ({ caller }) func updatePhysician(residentId : ResidentId, physicianId : Nat, name : Text, specialty : Text, contactInfo : Text) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update physicians");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedPhysicians = resident.physicians.map(
          func(phys) {
            if (phys.id == physicianId) {
              { id = physicianId; name; specialty; contactInfo };
            } else {
              phys;
            };
          }
        );

        let updatedResident = { resident with physicians = updatedPhysicians };
        residents.add(residentId, updatedResident);
      };
    };
  };

  // Medication Management
  public shared ({ caller }) func addMedicationToResident(residentId : ResidentId, medicationData : Medication) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add medications");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let medicationId = nextMedicationId;
        nextMedicationId += 1;

        let newMedication : Medication = {
          medicationData with
          id = medicationId;
        };

        let updatedMedications = resident.medications.concat([newMedication]);
        let updatedResident = { resident with medications = updatedMedications };

        residents.add(residentId, updatedResident);
        medicationId;
      };
    };
  };

  public shared ({ caller }) func updateMedication(residentId : ResidentId, medicationId : Nat, updatedMedication : Medication) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update medications");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedMedications = resident.medications.map(
          func(med) {
            if (med.id == medicationId) { updatedMedication } else { med };
          }
        );

        let updatedResident = { resident with medications = updatedMedications };
        residents.add(residentId, updatedResident);
      };
    };
  };

  public shared ({ caller }) func discontinueMedication(residentId : ResidentId, medicationId : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can discontinue medications");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedMedications = resident.medications.map(
          func(med) {
            if (med.id == medicationId) {
              { med with isActive = false };
            } else {
              med;
            };
          }
        );

        let updatedResident = { resident with medications = updatedMedications };
        residents.add(residentId, updatedResident);
      };
    };
  };

  public query ({ caller }) func getMedications(residentId : ResidentId) : async [Medication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's medications");
    };

    switch (residents.get(residentId)) {
      case (null) { [] };
      case (?resident) { resident.medications };
    };
  };

  // MAR (Medication Administration Record) Management
  public shared ({ caller }) func addMARRecord(residentId : ResidentId, medicationId : Nat, administrationTime : Text, administeredBy : Text, notes : Text) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add MAR records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let marId = nextMARId;
        nextMARId += 1;

        let newMAR : MARRecord = {
          id = marId;
          medicationId;
          administrationTime;
          administeredBy;
          notes;
          timestamp = Time.now();
        };

        let updatedMARRecords = resident.marRecords.concat([newMAR]);
        let updatedResident = { resident with marRecords = updatedMARRecords };

        residents.add(residentId, updatedResident);
        marId;
      };
    };
  };

  public query ({ caller }) func getMARRecords(residentId : ResidentId) : async [MARRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's MAR records");
    };

    switch (residents.get(residentId)) {
      case (null) { [] };
      case (?resident) { resident.marRecords };
    };
  };

  // ADL (Activities of Daily Living) Management
  public shared ({ caller }) func addADLRecord(residentId : ResidentId, date : Text, activity : Text, assistanceLevel : Text, staffNotes : Text) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add ADL records");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let adlId = nextADLId;
        nextADLId += 1;

        let newADL : ADLRecord = {
          id = adlId;
          date;
          activity;
          assistanceLevel;
          staffNotes;
          timestamp = Time.now();
        };

        let updatedADLRecords = resident.adlRecords.concat([newADL]);
        let updatedResident = { resident with adlRecords = updatedADLRecords };

        residents.add(residentId, updatedResident);
        adlId;
      };
    };
  };

  public query ({ caller }) func getADLRecords(residentId : ResidentId) : async [ADLRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's ADL records");
    };

    switch (residents.get(residentId)) {
      case (null) { [] };
      case (?resident) { resident.adlRecords };
    };
  };

  // Daily Vitals Management
  public shared ({ caller }) func addDailyVitals(
    residentId : ResidentId,
    temperature : Float,
    temperatureUnit : Text,
    bloodPressureSystolic : Nat,
    bloodPressureDiastolic : Nat,
    pulseRate : Nat,
    respiratoryRate : Nat,
    oxygenSaturation : Nat,
    bloodGlucose : ?Nat,
    measurementDate : Text,
    measurementTime : Text,
    notes : Text,
  ) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add daily vitals");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let vitalsId = nextVitalsId;
        nextVitalsId += 1;

        let newVitals : DailyVitals = {
          id = vitalsId;
          temperature;
          temperatureUnit;
          bloodPressureSystolic;
          bloodPressureDiastolic;
          pulseRate;
          respiratoryRate;
          oxygenSaturation;
          bloodGlucose;
          measurementDate;
          measurementTime;
          notes;
          timestamp = Time.now();
        };

        let updatedVitals = resident.dailyVitals.concat([newVitals]);
        let updatedResident = { resident with dailyVitals = updatedVitals };

        residents.add(residentId, updatedResident);
        vitalsId;
      };
    };
  };

  public query ({ caller }) func getDailyVitals(residentId : ResidentId) : async [DailyVitals] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's vitals");
    };

    switch (residents.get(residentId)) {
      case (null) { [] };
      case (?resident) { resident.dailyVitals };
    };
  };

  // Pharmacy Information Management
  public shared ({ caller }) func updatePharmacyInfo(residentId : ResidentId, pharmacyInfo : PharmacyInfo) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update pharmacy information");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedResident = { resident with pharmacyInfo = ?pharmacyInfo };
        residents.add(residentId, updatedResident);
      };
    };
  };

  // Insurance Information Management
  public shared ({ caller }) func updateInsuranceInfo(residentId : ResidentId, insuranceInfo : InsuranceInfo) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update insurance information");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedResident = { resident with insuranceInfo = ?insuranceInfo };
        residents.add(residentId, updatedResident);
      };
    };
  };

  // Responsible Contacts Management
  public shared ({ caller }) func addResponsibleContact(
    residentId : ResidentId,
    name : Text,
    relationship : Text,
    phone : Text,
    email : Text,
    isPrimary : Bool,
  ) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add responsible contacts");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let contactId = nextContactId;
        nextContactId += 1;

        let newContact : ResponsibleContact = {
          id = contactId;
          name;
          relationship;
          phone;
          email;
          isPrimary;
        };

        let updatedContacts = resident.responsibleContacts.concat([newContact]);
        let updatedResident = { resident with responsibleContacts = updatedContacts };

        residents.add(residentId, updatedResident);
        contactId;
      };
    };
  };

  public shared ({ caller }) func updateResponsibleContact(
    residentId : ResidentId,
    contactId : Nat,
    name : Text,
    relationship : Text,
    phone : Text,
    email : Text,
    isPrimary : Bool,
  ) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update responsible contacts");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedContacts = resident.responsibleContacts.map(
          func(contact) {
            if (contact.id == contactId) {
              { id = contactId; name; relationship; phone; email; isPrimary };
            } else {
              contact;
            };
          }
        );

        let updatedResident = { resident with responsibleContacts = updatedContacts };
        residents.add(residentId, updatedResident);
      };
    };
  };

  public query ({ caller }) func getResponsibleContacts(residentId : ResidentId) : async [ResponsibleContact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's contacts");
    };

    switch (residents.get(residentId)) {
      case (null) { [] };
      case (?resident) { resident.responsibleContacts };
    };
  };
};
