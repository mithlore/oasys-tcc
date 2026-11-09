// Datas no fuso de Brasília (RN03, RN04). O código mora em supabase/functions/_shared/datas.ts
// porque as Edge Functions (servidor) precisam dele; aqui só reexportamos para a interface
// usar a MESMA conta e nunca divergir do servidor.
export * from "../../supabase/functions/_shared/datas.ts";
