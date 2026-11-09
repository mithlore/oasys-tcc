// Check-in diário da home (RF16, RN03). Este arquivo só LÊ os dias da semana e PEDE o check-in.
// Quem realmente concede o XP é a Edge Function "checkin" no servidor (RN02, RNF02): o navegador
// não consegue dar XP a si mesmo, nem por aqui nem chamando as tabelas direto.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { hojeEmBrasilia, inicioDaSemana } from "@/lib/datas";

/** Resposta da Edge Function "checkin" (os campos que a tela usa). */
export interface RespostaCheckin {
  ja_fez_checkin: boolean;
  xp_ganho?: number;
  semana_completa?: boolean;
  mes_completo?: boolean;
}

/** Dias (AAAA-MM-DD) em que o usuário fez check-in na semana atual (domingo a sábado). */
export function useSemanaDeCheckins() {
  const { usuario } = useAuth();
  const hoje = hojeEmBrasilia(); // "hoje" no fuso de Brasília, igual ao servidor (RN03)
  const domingo = inicioDaSemana(hoje); // a semana começa no domingo, sem usar semana ISO
  return useQuery({
    queryKey: ["semana-checkins", usuario?.id, domingo],
    enabled: Boolean(usuario),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("daily_logs") // o RLS só devolve as linhas do próprio usuário
        .select("day")
        .eq("week_start", domingo);
      if (error) throw error;
      return (data ?? []).map((l) => l.day as string);
    },
  });
}

/** Pede o check-in ao servidor e, se der certo, atualiza o perfil (XP/nível) e a semana na tela. */
export function useFazerCheckin() {
  const { usuario } = useAuth();
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<RespostaCheckin> => {
      // O Supabase já anexa o token de login do usuário na chamada; a função confere quem é.
      const { data, error } = await supabase.functions.invoke("checkin", { method: "POST" });
      if (error) throw error;
      return data as RespostaCheckin;
    },
    onSuccess: () => {
      // Recarrega o que mudou: XP e nível no perfil, e os pontinhos da semana
      void cliente.invalidateQueries({ queryKey: ["perfil", usuario?.id] });
      void cliente.invalidateQueries({ queryKey: ["semana-checkins", usuario?.id] });
    },
  });
}
