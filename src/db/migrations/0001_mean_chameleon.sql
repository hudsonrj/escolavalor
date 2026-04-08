DO $$ BEGIN
 CREATE TYPE "public"."concurso_militar" AS ENUM('espcex', 'afa', 'efomm', 'en', 'ita', 'ime');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aprovacoes_universitarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"universidade" text NOT NULL,
	"curso" text,
	"quantidade" integer NOT NULL,
	"ano_referencia" integer NOT NULL,
	"coletado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "concursos_militares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"concurso" "concurso_militar" NOT NULL,
	"aprovados" integer NOT NULL,
	"ano_referencia" integer NOT NULL,
	"coletado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enem_detalhes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"nota_media" numeric(6, 2) NOT NULL,
	"nota_maxima" numeric(6, 2) NOT NULL,
	"nota_minima" numeric(6, 2),
	"redacao_media" numeric(6, 2),
	"redacao_maxima" numeric(6, 2),
	"total_alunos" integer NOT NULL,
	"ano_referencia" integer NOT NULL,
	"coletado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "aprovacoes_universitarias" ADD CONSTRAINT "aprovacoes_universitarias_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "concursos_militares" ADD CONSTRAINT "concursos_militares_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enem_detalhes" ADD CONSTRAINT "enem_detalhes_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
