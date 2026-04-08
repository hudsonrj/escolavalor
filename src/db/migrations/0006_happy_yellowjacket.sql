ALTER TABLE "escolas" ADD COLUMN "bairro" text;--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "endereco_completo" text;--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "cep" text;--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "rede_ensino" text;--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "total_professores" integer;--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "total_alunos" integer;--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "total_salas" integer;--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "niveis_ensino" text[];--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "turnos" text[];--> statement-breakpoint
ALTER TABLE "escolas" ADD COLUMN "ensino_integral" text;