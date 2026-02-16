import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    userType: UserType;
    name: string;
    relatedResidentIds: Array<bigint>;
}
export interface PharmacyInfo {
    id: bigint;
    fax: string;
    name: string;
    address: string;
    phone: string;
}
export type MedicationId = bigint;
export interface Resident {
    id: ResidentId;
    bed: string;
    dob: string;
    status: ResidentStatus;
    insuranceInfos: Array<InsuranceInfo>;
    admissionDate: string;
    marRecords: Array<MARRecord>;
    adlRecords: Array<ADLRecord>;
    roomNumber: string;
    medications: Array<Medication>;
    dailyVitals: Array<DailyVitals>;
    responsibleContacts: Array<ResponsibleContact>;
    medicaidNumber?: string;
    physicians: Array<Physician>;
    codeStatus: CodeStatus;
    lastName: string;
    roomType: string;
    medicareNumber?: string;
    pharmacyInfos: Array<PharmacyInfo>;
    firstName: string;
}
export interface Physician {
    id: bigint;
    contactInfo: string;
    name: string;
    specialty: string;
}
export interface MARRecord {
    id: bigint;
    medicationId: MedicationId;
    notes: string;
    timestamp: bigint;
    administrationTime: string;
    administeredBy: string;
}
export type HealthStatus = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "error";
    error: string;
} | {
    __kind__: "maintenance";
    maintenance: string;
};
export interface ADLRecord {
    id: bigint;
    staffNotes: string;
    assistanceLevel: string;
    date: string;
    timestamp: bigint;
    activity: string;
}
export interface CodeStatusChangeRecord {
    id: bigint;
    residentId: ResidentId;
    changedByName: string;
    changedBy: Principal;
    notes: string;
    timestamp: bigint;
    newStatus: CodeStatus;
    previousStatus: CodeStatus;
}
export interface ResponsibleContact {
    id: bigint;
    relationship: string;
    name: string;
    email: string;
    isPrimary: boolean;
    phone: string;
}
export interface DisplayPreferences {
    showPrintProfileButton: boolean;
    residentProfileEditorBackgroundMode: BackgroundMode;
}
export interface AppSettings {
    displayPreferences: DisplayPreferences;
}
export interface DailyVitals {
    id: bigint;
    temperatureUnit: string;
    bloodGlucose?: bigint;
    respiratoryRate: bigint;
    temperature: number;
    pulseRate: bigint;
    oxygenSaturation: bigint;
    notes: string;
    timestamp: bigint;
    measurementDate: string;
    bloodPressureDiastolic: bigint;
    measurementTime: string;
    bloodPressureSystolic: bigint;
}
export type ResidentId = bigint;
export interface Medication {
    id: MedicationId;
    dosage: string;
    prescribingPhysicianId?: bigint;
    name: string;
    administrationRoute: string;
    isActive: boolean;
    administrationTimes: Array<string>;
    notes: string;
    isPRN: boolean;
    dosageQuantity: string;
}
export interface InsuranceInfo {
    id: bigint;
    groupNumber: string;
    provider: string;
    medicaidNumber?: string;
    policyNumber: string;
    medicareNumber?: string;
}
export enum BackgroundMode {
    solidBlack = "solidBlack",
    solidWhite = "solidWhite"
}
export enum CodeStatus {
    dnr = "dnr",
    fullCode = "fullCode"
}
export enum ResidentStatus {
    active = "active",
    discharged = "discharged"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserType {
    familyMember = "familyMember",
    staff = "staff",
    resident = "resident"
}
export interface backendInterface {
    addADLRecord(residentId: ResidentId, date: string, activity: string, assistanceLevel: string, staffNotes: string): Promise<bigint>;
    addDailyVitals(residentId: ResidentId, temperature: number, temperatureUnit: string, bloodPressureSystolic: bigint, bloodPressureDiastolic: bigint, pulseRate: bigint, respiratoryRate: bigint, oxygenSaturation: bigint, bloodGlucose: bigint | null, measurementDate: string, measurementTime: string, notes: string): Promise<bigint>;
    addInsuranceInfo(residentId: ResidentId, insurance: InsuranceInfo): Promise<bigint>;
    addMARRecord(residentId: ResidentId, medicationId: MedicationId, administrationTime: string, administeredBy: string, notes: string): Promise<bigint>;
    addMedication(residentId: ResidentId, medication: Medication): Promise<MedicationId>;
    addPharmacyInfo(residentId: ResidentId, pharmacy: PharmacyInfo): Promise<bigint>;
    addPhysician(residentId: ResidentId, physician: Physician): Promise<bigint>;
    addResident(residentData: Resident): Promise<ResidentId>;
    addResponsibleContact(residentId: ResidentId, contact: ResponsibleContact): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteInsuranceInfo(residentId: ResidentId, insuranceId: bigint): Promise<void>;
    deletePharmacyInfo(residentId: ResidentId, pharmacyId: bigint): Promise<void>;
    deletePhysician(residentId: ResidentId, physicianId: bigint): Promise<void>;
    deleteResident(residentId: ResidentId): Promise<void>;
    deleteResponsibleContact(residentId: ResidentId, contactId: bigint): Promise<void>;
    discontinueMedication(residentId: ResidentId, medicationId: MedicationId): Promise<void>;
    getADLRecords(residentId: ResidentId): Promise<Array<ADLRecord>>;
    getAllResidents(): Promise<Array<Resident>>;
    getAppSettings(): Promise<AppSettings>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCodeStatus(residentId: ResidentId): Promise<CodeStatus | null>;
    getCodeStatusHistory(residentId: ResidentId): Promise<Array<CodeStatusChangeRecord>>;
    getHealthStatus(): Promise<HealthStatus>;
    getInsuranceInfo(residentId: ResidentId, insuranceId: bigint): Promise<InsuranceInfo | null>;
    getMARRecords(residentId: ResidentId): Promise<Array<MARRecord>>;
    getMedication(residentId: ResidentId, medicationId: MedicationId): Promise<Medication | null>;
    getPharmacyInfo(residentId: ResidentId, pharmacyId: bigint): Promise<PharmacyInfo | null>;
    getPhysician(residentId: ResidentId, physicianId: bigint): Promise<Physician | null>;
    getResident(residentId: ResidentId): Promise<Resident | null>;
    getResidentStats(): Promise<{
        activeResidents: bigint;
        dischargedResidents: bigint;
        totalResidents: bigint;
    }>;
    getResidentsByFilter(roomNumber: string | null, status: ResidentStatus | null): Promise<Array<Resident>>;
    getResponsibleContact(residentId: ResidentId, contactId: bigint): Promise<ResponsibleContact | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reactivateMedication(residentId: ResidentId, medicationId: MedicationId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCodeStatus(residentId: ResidentId, newCodeStatus: CodeStatus, notes: string): Promise<void>;
    updateDisplayPreferences(preferences: DisplayPreferences): Promise<void>;
    updateInsuranceInfo(residentId: ResidentId, insuranceId: bigint, updatedInsurance: InsuranceInfo): Promise<void>;
    updateMedication(residentId: ResidentId, medicationId: MedicationId, updatedMedication: Medication): Promise<void>;
    updatePharmacyInfo(residentId: ResidentId, pharmacyId: bigint, updatedPharmacy: PharmacyInfo): Promise<void>;
    updatePhysician(residentId: ResidentId, physicianId: bigint, updatedPhysician: Physician): Promise<void>;
    updateResident(residentId: ResidentId, updatedData: Resident): Promise<void>;
    updateResponsibleContact(residentId: ResidentId, contactId: bigint, updatedContact: ResponsibleContact): Promise<void>;
}
