// Busca o perfil de quem está logado (nome, XP e nível) para o cabeçalho e as telas (RF09, RF15).
// O RLS do banco só deixa usuários logados lerem perfis (RF01). XP e nível NUNCA são gravados
// por aqui: só leitura (RN02).
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface Perfil {
  id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  level: number;
}

export function usePerfil() {
  const { usuario } = useAuth();
  return useQuery({
    queryKey: ["perfil", usuario?.id], // cache separado por usuário
    enabled: Boolean(usuario), // só consulta quando há alguém logado
    queryFn: async (): Promise<Perfil> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, xp, level")
        .eq("id", usuario!.id)
        .single();
      if (error) throw error;
      return data as Perfil;
    },
  });
}
