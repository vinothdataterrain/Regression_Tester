import { useGetMyProfileQuery } from "../services/profile";

export const useProfile = () => {
  const { data: profile, error, isLoading, refetch } = useGetMyProfileQuery({},{refetchOnMountOrArgChange:true});
  
  return {
    profile,
    error,
    isLoading,
    refetch,
  };
};