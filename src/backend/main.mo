import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type HealthStatus = {
    #ok : Text;
    #error : Text;
    #maintenance : Text;
  };

  public query ({ caller }) func getHealthStatus() : async HealthStatus {
    // Healthcare applications should not expose system status to anonymous users
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    #ok("Backend healthy - version 2024-06-13");
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ResidentId = Nat;
  type MedicationId = Nat;

  public type UserType = {
    #staff;
    #resident;
    #familyMember;
  };

  public type UserProfile = {
    name : Text;
    userType : UserType;
    relatedResidentIds : [Nat];
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required to access profile");
    };

    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Application Settings
  public type BackgroundMode = {
    #solidWhite;
    #solidBlack;
  };

  public type DisplayPreferences = {
    showPrintProfileButton : Bool;
    residentProfileEditorBackgroundMode : BackgroundMode;
  };

  public type AppSettings = {
    displayPreferences : DisplayPreferences;
  };

  var appSettings : AppSettings = {
    displayPreferences = {
      showPrintProfileButton = true;
      residentProfileEditorBackgroundMode = #solidWhite;
    };
  };

  public query ({ caller }) func getAppSettings() : async AppSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    appSettings;
  };

  public shared ({ caller }) func updateDisplayPreferences(preferences : DisplayPreferences) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update display preferences");
    };
    appSettings := {
      displayPreferences = preferences;
    };
  };

  public type ResidentStatus = { #active; #discharged };
  public type CodeStatus = { #fullCode; #dnr };

  public type Physician = {
    id : Nat;
    name : Text;
    specialty : Text;
    contactInfo : Text;
  };

  public type PharmacyInfo = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    fax : Text;
  };

  public type InsuranceInfo = {
    id : Nat;
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
    id : MedicationId;
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

  public type MARRecord = {
    id : Nat;
    medicationId : MedicationId;
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

  public type CodeStatusChangeRecord = {
    id : Nat;
    residentId : ResidentId;
    previousStatus : CodeStatus;
    newStatus : CodeStatus;
    changedBy : Principal;
    changedByName : Text;
    timestamp : Int;
    notes : Text;
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
    codeStatus : CodeStatus;
    medicaidNumber : ?Text;
    medicareNumber : ?Text;
    physicians : [Physician];
    pharmacyInfos : [PharmacyInfo];
    insuranceInfos : [InsuranceInfo];
    responsibleContacts : [ResponsibleContact];
    medications : [Medication];
    marRecords : [MARRecord];
    adlRecords : [ADLRecord];
    dailyVitals : [DailyVitals];
  };

  var residents = Map.empty<ResidentId, Resident>();
  var nextId = 0;
  var nextMARId = 1;
  var nextADLId = 1;
  var nextVitalsId = 1;
  var nextCodeStatusChangeId = 1;

  let codeStatusChanges = Map.empty<Nat, CodeStatusChangeRecord>();

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
    if (isStaffOrAdmin(caller)) {
      return true;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.relatedResidentIds.any(func(id) { id == residentId });
      };
    };
  };

  public shared ({ caller }) func addResident(residentData : Resident) : async ResidentId {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add residents");
    };

    let residentId = getNextId();
    let newResident : Resident = { residentData with id = residentId };
    residents.add(residentId, newResident);
    residentId;
  };

  func getNextId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
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

    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff and admins can view all residents");
    };

    residents.values().toArray();
  };

  public shared ({ caller }) func deleteResident(residentId : ResidentId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete residents");
    };

    residents.remove(residentId);
  };

  public query ({ caller }) func getPhysician(residentId : ResidentId, physicianId : Nat) : async ?Physician {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's information");
    };

    switch (residents.get(residentId)) {
      case (null) { null };
      case (?resident) {
        resident.physicians.find(func(p) { p.id == physicianId });
      };
    };
  };

  public shared ({ caller }) func addPhysician(residentId : ResidentId, physician : Physician) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add physicians");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let newId = getNextId();
        let newPhysician = { physician with id = newId };
        let updatedPhysicians = resident.physicians.concat([newPhysician]);
        residents.add(
          residentId,
          { resident with physicians = updatedPhysicians },
        );
        newId;
      };
    };
  };

  public shared ({ caller }) func updatePhysician(residentId : ResidentId, physicianId : Nat, updatedPhysician : Physician) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update physicians");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let patchedPhysicians = resident.physicians.map(
          func(p) {
            if (p.id == physicianId) { updatedPhysician } else { p };
          }
        );
        residents.add(
          residentId,
          { resident with physicians = patchedPhysicians },
        );
      };
    };
  };

  public shared ({ caller }) func deletePhysician(residentId : ResidentId, physicianId : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can delete physicians");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let filteredPhysicians = resident.physicians.filter(
          func(p) { p.id != physicianId }
        );
        residents.add(
          residentId,
          { resident with physicians = filteredPhysicians },
        );
      };
    };
  };

  public query ({ caller }) func getPharmacyInfo(residentId : ResidentId, pharmacyId : Nat) : async ?PharmacyInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's information");
    };

    switch (residents.get(residentId)) {
      case (null) { null };
      case (?resident) {
        resident.pharmacyInfos.find(func(p) { p.id == pharmacyId });
      };
    };
  };

  public shared ({ caller }) func addPharmacyInfo(residentId : ResidentId, pharmacy : PharmacyInfo) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add pharmacy info");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let newId = getNextId();
        let newPharmacy = { pharmacy with id = newId };
        let updatedPharmacies = resident.pharmacyInfos.concat([newPharmacy]);
        residents.add(
          residentId,
          { resident with pharmacyInfos = updatedPharmacies },
        );
        newId;
      };
    };
  };

  public shared ({ caller }) func updatePharmacyInfo(residentId : ResidentId, pharmacyId : Nat, updatedPharmacy : PharmacyInfo) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update pharmacy info");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let patchedPharmacies = resident.pharmacyInfos.map(
          func(p) {
            if (p.id == pharmacyId) { updatedPharmacy } else { p };
          }
        );
        residents.add(
          residentId,
          { resident with pharmacyInfos = patchedPharmacies },
        );
      };
    };
  };

  public shared ({ caller }) func deletePharmacyInfo(residentId : ResidentId, pharmacyId : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can delete pharmacy info");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let filteredPharmacies = resident.pharmacyInfos.filter(
          func(p) { p.id != pharmacyId }
        );
        residents.add(
          residentId,
          { resident with pharmacyInfos = filteredPharmacies },
        );
      };
    };
  };

  public query ({ caller }) func getInsuranceInfo(residentId : ResidentId, insuranceId : Nat) : async ?InsuranceInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's information");
    };

    switch (residents.get(residentId)) {
      case (null) { null };
      case (?resident) {
        resident.insuranceInfos.find(func(i) { i.id == insuranceId });
      };
    };
  };

  public shared ({ caller }) func addInsuranceInfo(residentId : ResidentId, insurance : InsuranceInfo) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add insurance info");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let newId = getNextId();
        let newInsurance = { insurance with id = newId };
        let updatedInsurances = resident.insuranceInfos.concat([newInsurance]);
        residents.add(
          residentId,
          { resident with insuranceInfos = updatedInsurances },
        );
        newId;
      };
    };
  };

  public shared ({ caller }) func updateInsuranceInfo(residentId : ResidentId, insuranceId : Nat, updatedInsurance : InsuranceInfo) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update insurance info");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let patchedInsurances = resident.insuranceInfos.map(
          func(i) {
            if (i.id == insuranceId) { updatedInsurance } else { i };
          }
        );
        residents.add(
          residentId,
          { resident with insuranceInfos = patchedInsurances },
        );
      };
    };
  };

  public shared ({ caller }) func deleteInsuranceInfo(residentId : ResidentId, insuranceId : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can delete insurance info");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let filteredInsurances = resident.insuranceInfos.filter(
          func(i) { i.id != insuranceId }
        );
        residents.add(
          residentId,
          { resident with insuranceInfos = filteredInsurances },
        );
      };
    };
  };

  public query ({ caller }) func getResponsibleContact(residentId : ResidentId, contactId : Nat) : async ?ResponsibleContact {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's information");
    };

    switch (residents.get(residentId)) {
      case (null) { null };
      case (?resident) {
        resident.responsibleContacts.find(func(c) { c.id == contactId });
      };
    };
  };

  public shared ({ caller }) func addResponsibleContact(residentId : ResidentId, contact : ResponsibleContact) : async Nat {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add contacts");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let newId = getNextId();
        let newContact = { contact with id = newId };
        let updatedContacts = resident.responsibleContacts.concat([newContact]);
        residents.add(
          residentId,
          { resident with responsibleContacts = updatedContacts },
        );
        newId;
      };
    };
  };

  public shared ({ caller }) func updateResponsibleContact(residentId : ResidentId, contactId : Nat, updatedContact : ResponsibleContact) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update contacts");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let patchedContacts = resident.responsibleContacts.map(
          func(c) {
            if (c.id == contactId) { updatedContact } else { c };
          }
        );
        residents.add(
          residentId,
          { resident with responsibleContacts = patchedContacts },
        );
      };
    };
  };

  public shared ({ caller }) func deleteResponsibleContact(residentId : ResidentId, contactId : Nat) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can delete contacts");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let filteredContacts = resident.responsibleContacts.filter(
          func(c) { c.id != contactId }
        );
        residents.add(
          residentId,
          { resident with responsibleContacts = filteredContacts },
        );
      };
    };
  };

  public query ({ caller }) func getMedication(residentId : ResidentId, medicationId : MedicationId) : async ?Medication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's information");
    };

    switch (residents.get(residentId)) {
      case (null) { null };
      case (?resident) {
        resident.medications.find(func(m) { m.id == medicationId });
      };
    };
  };

  public shared ({ caller }) func addMedication(residentId : ResidentId, medication : Medication) : async MedicationId {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can add medications");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let newId = getNextId();
        let newMedication = { medication with id = newId };
        let updatedMedications = resident.medications.concat([newMedication]);
        residents.add(
          residentId,
          { resident with medications = updatedMedications },
        );
        newId;
      };
    };
  };

  public shared ({ caller }) func updateMedication(residentId : ResidentId, medicationId : MedicationId, updatedMedication : Medication) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can update medications");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let patchedMedications = resident.medications.map(
          func(m) {
            if (m.id == medicationId) { updatedMedication } else { m };
          }
        );
        residents.add(
          residentId,
          { resident with medications = patchedMedications },
        );
      };
    };
  };

  public shared ({ caller }) func discontinueMedication(residentId : ResidentId, medicationId : MedicationId) : async () {
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
          func(m) {
            if (m.id == medicationId) { { m with isActive = false } } else { m };
          }
        );
        residents.add(
          residentId,
          { resident with medications = updatedMedications },
        );
      };
    };
  };

  public shared ({ caller }) func reactivateMedication(residentId : ResidentId, medicationId : MedicationId) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins and staff can reactivate medications");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let updatedMedications = resident.medications.map(
          func(m) {
            if (m.id == medicationId) { { m with isActive = true } } else { m };
          }
        );
        residents.add(
          residentId,
          { resident with medications = updatedMedications },
        );
      };
    };
  };

  public shared ({ caller }) func addMARRecord(residentId : ResidentId, medicationId : MedicationId, administrationTime : Text, administeredBy : Text, notes : Text) : async Nat {
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

  public shared ({ caller }) func updateCodeStatus(residentId : ResidentId, newCodeStatus : CodeStatus, notes : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update Code Status");
    };

    switch (residents.get(residentId)) {
      case (null) { Runtime.trap("Resident not found") };
      case (?resident) {
        let previousStatus = resident.codeStatus;

        if (previousStatus != newCodeStatus) {
          let callerName = switch (userProfiles.get(caller)) {
            case (null) { caller.toText() };
            case (?profile) { profile.name };
          };

          let changeId = nextCodeStatusChangeId;
          nextCodeStatusChangeId += 1;

          let changeRecord : CodeStatusChangeRecord = {
            id = changeId;
            residentId;
            previousStatus;
            newStatus = newCodeStatus;
            changedBy = caller;
            changedByName = callerName;
            timestamp = Time.now();
            notes;
          };

          codeStatusChanges.add(changeId, changeRecord);

          let updatedResident = { resident with codeStatus = newCodeStatus };
          residents.add(residentId, updatedResident);
        };
      };
    };
  };

  public query ({ caller }) func getCodeStatus(residentId : ResidentId) : async ?CodeStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's Code Status");
    };

    switch (residents.get(residentId)) {
      case (null) { null };
      case (?resident) { ?resident.codeStatus };
    };
  };

  public query ({ caller }) func getCodeStatusHistory(residentId : ResidentId) : async [CodeStatusChangeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not canAccessResident(caller, residentId)) {
      Runtime.trap("Unauthorized: Cannot access this resident's Code Status history");
    };

    codeStatusChanges.values().toArray().filter(
      func(record) { record.residentId == residentId }
    );
  };

  public query ({ caller }) func getResidentsByFilter(roomNumber : ?Text, status : ?ResidentStatus) : async [Resident] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

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
};
