import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useResilientActor } from './useResilientActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Resident, ResidentId, Medication, MARRecord, ADLRecord, DailyVitals, PharmacyInfo, InsuranceInfo, ResidentStatus, ResponsibleContact, Physician, AppSettings, DisplayPreferences } from '../backend';
import { toast } from 'sonner';
import { canListAllResidents } from '../lib/auth/helpers';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useResilientActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) {
        console.error('[Profile Query] Actor not available');
        throw new Error('Actor not available');
      }
      console.log('[Profile Query] Fetching caller user profile');
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('[Profile Query] Profile fetched:', profile ? 'exists' : 'null (new user)');
        return profile;
      } catch (error: any) {
        console.error('[Profile Query] Failed to fetch profile:', error.message);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useResilientActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetAppSettings() {
  const { actor, isFetching } = useResilientActor();
  const { identity } = useInternetIdentity();

  return useQuery<AppSettings>({
    queryKey: ['appSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAppSettings();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateDisplayPreferences() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: DisplayPreferences) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDisplayPreferences(preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      toast.success('Display preferences updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update display preferences');
    },
  });
}

export function useGetResidentStats() {
  const { actor, isFetching } = useResilientActor();

  return useQuery({
    queryKey: ['residentStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getResidentStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllResidents() {
  const { actor, isFetching } = useResilientActor();

  return useQuery<Resident[]>({
    queryKey: ['residents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllResidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAccessibleResidents() {
  const { actor, isFetching: actorFetching } = useResilientActor();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isFetched: profileFetched, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin = false, isFetched: adminFetched, isLoading: adminLoading } = useIsCallerAdmin();

  const canListAll = canListAllResidents(userProfile, isAdmin);

  const query = useQuery<Resident[]>({
    queryKey: ['accessibleResidents', isAdmin, userProfile?.relatedResidentIds.map(id => id.toString())],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      if (canListAll) {
        return actor.getAllResidents();
      }
      
      if (!userProfile || !userProfile.relatedResidentIds.length) {
        return [];
      }

      const residents = await Promise.all(
        userProfile.relatedResidentIds.map(async (id) => {
          try {
            return await actor.getResident(id);
          } catch {
            return null;
          }
        })
      );

      return residents.filter((r): r is Resident => r !== null);
    },
    enabled: !!actor && !actorFetching && !!identity && profileFetched && adminFetched,
  });

  return {
    ...query,
    isLoading: actorFetching || profileLoading || adminLoading || query.isLoading,
    isFetched: !!actor && !actorFetching && profileFetched && adminFetched && query.isFetched,
  };
}

export function useGetResident(residentId: ResidentId | undefined) {
  const { actor, isFetching } = useResilientActor();

  return useQuery<Resident | null>({
    queryKey: ['resident', residentId?.toString()],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or resident ID not available');
      return actor.getResident(residentId);
    },
    enabled: !!actor && !isFetching && !!residentId,
  });
}

export function useAddResident() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (residentData: Resident) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addResident(residentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['accessibleResidents'] });
      queryClient.invalidateQueries({ queryKey: ['residentStats'] });
      toast.success('Resident added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add resident');
    },
  });
}

export function useUpdateResident() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, updatedData }: { residentId: ResidentId; updatedData: Resident }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateResident(residentId, updatedData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['accessibleResidents'] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Resident updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update resident');
    },
  });
}

export function useDeleteResident() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (residentId: ResidentId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteResident(residentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['accessibleResidents'] });
      queryClient.invalidateQueries({ queryKey: ['residentStats'] });
      toast.success('Resident deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete resident');
    },
  });
}

export function useGetMedications(residentId: ResidentId | undefined) {
  const { actor, isFetching } = useResilientActor();

  return useQuery<Medication[]>({
    queryKey: ['medications', residentId?.toString()],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or resident ID not available');
      const resident = await actor.getResident(residentId);
      return resident?.medications || [];
    },
    enabled: !!actor && !isFetching && !!residentId,
  });
}

export function useAddMedication() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationData }: { residentId: ResidentId; medicationData: Medication }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMedication(residentId, medicationData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.residentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Medication added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add medication');
    },
  });
}

export function useUpdateMedication() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationId, updatedMedication }: { residentId: ResidentId; medicationId: bigint; updatedMedication: Medication }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMedication(residentId, medicationId, updatedMedication);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.residentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Medication updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update medication');
    },
  });
}

export function useDiscontinueMedication() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationId }: { residentId: ResidentId; medicationId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.discontinueMedication(residentId, medicationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.residentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Medication discontinued successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to discontinue medication');
    },
  });
}

export function useReactivateMedication() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationId }: { residentId: ResidentId; medicationId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reactivateMedication(residentId, medicationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.residentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Medication reactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reactivate medication');
    },
  });
}

export function useAddMARRecord() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, medicationId, administrationTime, administeredBy, notes }: { residentId: ResidentId; medicationId: bigint; administrationTime: string; administeredBy: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMARRecord(residentId, medicationId, administrationTime, administeredBy, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marRecords', variables.residentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('MAR record added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add MAR record');
    },
  });
}

export function useGetMARRecords(residentId: ResidentId | undefined) {
  const { actor, isFetching } = useResilientActor();

  return useQuery<MARRecord[]>({
    queryKey: ['marRecords', residentId?.toString()],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or resident ID not available');
      return actor.getMARRecords(residentId);
    },
    enabled: !!actor && !isFetching && !!residentId,
  });
}

export function useAddADLRecord() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, date, activity, assistanceLevel, staffNotes }: { residentId: ResidentId; date: string; activity: string; assistanceLevel: string; staffNotes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addADLRecord(residentId, date, activity, assistanceLevel, staffNotes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adlRecords', variables.residentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('ADL record added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add ADL record');
    },
  });
}

export function useGetADLRecords(residentId: ResidentId | undefined) {
  const { actor, isFetching } = useResilientActor();

  return useQuery<ADLRecord[]>({
    queryKey: ['adlRecords', residentId?.toString()],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or resident ID not available');
      return actor.getADLRecords(residentId);
    },
    enabled: !!actor && !isFetching && !!residentId,
  });
}

export function useAddDailyVitals() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, temperature, temperatureUnit, bloodPressureSystolic, bloodPressureDiastolic, pulseRate, respiratoryRate, oxygenSaturation, bloodGlucose, measurementDate, measurementTime, notes }: { residentId: ResidentId; temperature: number; temperatureUnit: string; bloodPressureSystolic: bigint; bloodPressureDiastolic: bigint; pulseRate: bigint; respiratoryRate: bigint; oxygenSaturation: bigint; bloodGlucose: bigint | null; measurementDate: string; measurementTime: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDailyVitals(residentId, temperature, temperatureUnit, bloodPressureSystolic, bloodPressureDiastolic, pulseRate, respiratoryRate, oxygenSaturation, bloodGlucose, measurementDate, measurementTime, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyVitals', variables.residentId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Daily vitals recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record daily vitals');
    },
  });
}

export function useGetDailyVitals(residentId: ResidentId | undefined) {
  const { actor, isFetching } = useResilientActor();

  return useQuery<DailyVitals[]>({
    queryKey: ['dailyVitals', residentId?.toString()],
    queryFn: async () => {
      if (!actor || !residentId) throw new Error('Actor or resident ID not available');
      const resident = await actor.getResident(residentId);
      return resident?.dailyVitals || [];
    },
    enabled: !!actor && !isFetching && !!residentId,
  });
}

export function useAddResponsibleContact() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, contact }: { residentId: ResidentId; contact: ResponsibleContact }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addResponsibleContact(residentId, contact);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Responsible person added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add responsible person');
    },
  });
}

export function useUpdateResponsibleContact() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, contactId, updatedContact }: { residentId: ResidentId; contactId: bigint; updatedContact: ResponsibleContact }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateResponsibleContact(residentId, contactId, updatedContact);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Responsible person updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update responsible person');
    },
  });
}

export function useAddPharmacyInfo() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, pharmacy }: { residentId: ResidentId; pharmacy: PharmacyInfo }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPharmacyInfo(residentId, pharmacy);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Pharmacy added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add pharmacy');
    },
  });
}

export function useUpdatePharmacyInfo() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, pharmacyId, updatedPharmacy }: { residentId: ResidentId; pharmacyId: bigint; updatedPharmacy: PharmacyInfo }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePharmacyInfo(residentId, pharmacyId, updatedPharmacy);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Pharmacy updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update pharmacy');
    },
  });
}

export function useAddInsuranceInfo() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, insurance }: { residentId: ResidentId; insurance: InsuranceInfo }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addInsuranceInfo(residentId, insurance);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Insurance added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add insurance');
    },
  });
}

export function useUpdateInsuranceInfo() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, insuranceId, updatedInsurance }: { residentId: ResidentId; insuranceId: bigint; updatedInsurance: InsuranceInfo }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInsuranceInfo(residentId, insuranceId, updatedInsurance);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Insurance updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update insurance');
    },
  });
}

export function useAddPhysician() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, physician }: { residentId: ResidentId; physician: Physician }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPhysician(residentId, physician);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Physician added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add physician');
    },
  });
}

export function useUpdatePhysician() {
  const { actor } = useResilientActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, physicianId, updatedPhysician }: { residentId: ResidentId; physicianId: bigint; updatedPhysician: Physician }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePhysician(residentId, physicianId, updatedPhysician);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resident', variables.residentId.toString()] });
      toast.success('Physician updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update physician');
    },
  });
}
