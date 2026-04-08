DO $$ BEGIN
 CREATE TYPE "public"."metodologia" AS ENUM('tradicional', 'montessori', 'waldorf', 'construtivista', 'sociointeracionista', 'freiriana', 'internacional');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "informacoes_escola" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"metodologia" "metodologia",
	"inclusao" text,
	"atividades_extracurriculares" text[],
	"diferenciais" text[],
	"avaliacao_mec" numeric(3, 2),
	"nota_pais" numeric(3, 2),
	"total_avaliacoes_pais" integer,
	"infraestrutura" text[],
	"site" text,
	"telefone" text,
	"email" text,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "informacoes_escola_escola_id_unique" UNIQUE("escola_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "informacoes_escola" ADD CONSTRAINT "informacoes_escola_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
