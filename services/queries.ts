import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import { LigandAPI, ParsedLigandData } from "./ligandAPI";
import { AuthAPI } from "./authAPI";

export const QUERY_KEYS = {
  ligand: (id: string) => ["ligand", id] as const,
  auth: {
    token: (code: string) => ["auth", "token", code] as const,
    user: (token: string) => ["auth", "user", token] as const,
  },
} as const;

export interface LigandDataResult {
  isParsing: boolean;
}

export function useLigandData(
  ligandId: string
): UseQueryResult<ParsedLigandData, Error> & LigandDataResult {
  const [isParsing, setIsParsing] = useState(false);

  const queryResult = useQuery({
    queryKey: QUERY_KEYS.ligand(ligandId),
    queryFn: async () => {
      const data = await LigandAPI.fetchLigandData(ligandId, {
        onParseStart: () => {
          setIsParsing(true);
        },
      });

      setIsParsing(false);
      return data;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    ...queryResult,
    isParsing,
  };
}

// Authentication hooks
export function useAuthToken(code: string, codeVerifier?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.token(code),
    queryFn: () => AuthAPI.exchangeCodeForToken(code, codeVerifier),
    enabled: !!code, // Only run when we have a code
    retry: 1,
    staleTime: 0, // Don't cache tokens
    gcTime: 0, // Don't keep in cache
  });
}

export function useUserInfo(accessToken: string) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.user(accessToken),
    queryFn: () => AuthAPI.getUserInfo(accessToken),
    enabled: !!accessToken, // Only run when we have a token
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
