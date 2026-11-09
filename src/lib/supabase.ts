// Cliente do Supabase usado pelo navegador. Usa SÓ a chave pública (anon): quem protege os dados
// é o RLS no banco (RNF01), não o esconder de chaves. A chave secreta (service_role) nunca entra aqui.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Falso enquanto o .env.local não estiver preenchido: a interface mostra um aviso em vez de quebrar. */
export const supabaseConfigurado = Boolean(url && chave);

export const supabase = createClient(url ?? "http://localhost:54321", chave ?? "sem-chave");
