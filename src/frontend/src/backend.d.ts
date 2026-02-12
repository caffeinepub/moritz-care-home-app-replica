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
    fax: string;
    name: string;
    address: string;
    phone: string;
}
export interface Resident {
    id: ResidentId;
    bed: string;
    dob: string;
    status: ResidentStatus;
    insuranceInfo?: InsuranceInfo;
    admissionDate: string;
    marRecords: Array<MARRecord>;
    adlRecords: Array<ADLRecord>;
    roomNumber: string;
    pharmacyInfo?: PharmacyInfo;
    medications: Array<Medication>;
    dailyVitals: Array<DailyVitals>;
    responsibleContacts: Array<ResponsibleContact>;
    medicaidNumber?: string;
    physicians: Array<Physician>;
    codeStatus: CodeStatus;
    lastName: string;
    roomType: string;
    medicareNumber?: string;
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
    medicationId: bigint;
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
    id: bigint;
    dosage: string;
    prescribingPhysicianId?: bigint;
    name: string;
    administrationRoute: string;
    isActive: boolean;
    administrationTimes: Array<string>;
    notes: string;
    dosageQuantity: string;
}
export interface InsuranceInfo {
    groupNumber: string;
    provider: string;
    medicaidNumber?: string;
    policyNumber: string;
    medicareNumber?: string;
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
    addMARRecord(residentId: ResidentId, medicationId: bigint, administrationTime: string, administeredBy: string, notes: string): Promise<bigint>;
    addMedicationToResident(residentId: ResidentId, medicationData: Medication): Promise<bigint>;
    addPhysicianToResident(residentId: ResidentId, name: string, specialty: string, contactInfo: string): Promise<bigint>;
    addResident(residentData: Resident): Promise<ResidentId>;
    addResponsibleContact(residentId: ResidentId, name: string, relationship: string, phone: string, email: string, isPrimary: boolean): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteResident(residentId: ResidentId): Promise<void>;
    dischargeResident(residentId: ResidentId): Promise<void>;
    discontinueMedication(residentId: ResidentId, medicationId: bigint): Promise<void>;
    getADLRecords(residentId: ResidentId): Promise<Array<ADLRecord>>;
    getAllResidents(): Promise<Array<Resident>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCodeStatus(residentId: ResidentId): Promise<CodeStatus | null>;
    getCodeStatusHistory(residentId: ResidentId): Promise<Array<CodeStatusChangeRecord>>;
    getDailyVitals(residentId: ResidentId): Promise<Array<DailyVitals>>;
    getHealthStatus(): Promise<HealthStatus>;
    getMARRecords(residentId: ResidentId): Promise<Array<MARRecord>>;
    getMedications(residentId: ResidentId): Promise<Array<Medication>>;
    getResident(residentId: ResidentId): Promise<Resident | null>;
    getResidentStats(): Promise<{
        activeResidents: bigint;
        dischargedResidents: bigint;
        totalResidents: bigint;
    }>;
    getResidentsByFilter(roomNumber: string | null, status: ResidentStatus | null): Promise<Array<Resident>>;
    getResponsibleContacts(residentId: ResidentId): Promise<Array<ResponsibleContact>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reactivateMedication(residentId: ResidentId, medicationId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCodeStatus(residentId: ResidentId, newCodeStatus: CodeStatus, notes: string): Promise<void>;
    updateInsuranceInfo(residentId: ResidentId, insuranceInfo: InsuranceInfo): Promise<void>;
    updateMedication(residentId: ResidentId, medicationId: bigint, updatedMedication: Medication): Promise<void>;
    updatePharmacyInfo(residentId: ResidentId, pharmacyInfo: PharmacyInfo): Promise<void>;
    updatePhysician(residentId: ResidentId, physicianId: bigint, name: string, specialty: string, contactInfo: string): Promise<void>;
    updateResident(residentId: ResidentId, updatedData: Resident): Promise<void>;
    updateResponsibleContact(residentId: ResidentId, contactId: bigint, name: string, relationship: string, phone: string, email: string, isPrimary: boolean): Promise<void>;
}
