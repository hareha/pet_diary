import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PetProfile, GuardianProfile } from '@/types/user';
import { getPetProfile, getGuardianProfile, savePetProfile, saveGuardianProfile } from '@/services/user-storage';

interface PetContextType {
  pet: PetProfile | null;
  guardian: GuardianProfile | null;
  isLoading: boolean;
  refreshProfiles: () => Promise<void>;
  updatePet: (profile: Partial<PetProfile>) => Promise<void>;
  updateGuardian: (profile: Partial<GuardianProfile>) => Promise<void>;
}

const PetContext = createContext<PetContextType>({
  pet: null,
  guardian: null,
  isLoading: true,
  refreshProfiles: async () => {},
  updatePet: async () => {},
  updateGuardian: async () => {},
});

export function PetProvider({ children }: { children: ReactNode }) {
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [guardian, setGuardian] = useState<GuardianProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const [petData, guardianData] = await Promise.all([
        getPetProfile(),
        getGuardianProfile(),
      ]);
      setPet(petData);
      setGuardian(guardianData);
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePet = useCallback(async (profile: Partial<PetProfile>) => {
    const saved = await savePetProfile({ ...pet, ...profile } as PetProfile);
    setPet(saved);
  }, [pet]);

  const updateGuardian = useCallback(async (profile: Partial<GuardianProfile>) => {
    const saved = await saveGuardianProfile({ ...guardian, ...profile } as GuardianProfile);
    setGuardian(saved);
  }, [guardian]);

  return (
    <PetContext.Provider value={{ pet, guardian, isLoading, refreshProfiles, updatePet, updateGuardian }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  return useContext(PetContext);
}
