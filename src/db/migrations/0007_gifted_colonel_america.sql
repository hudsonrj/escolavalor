DO $$ BEGIN
 CREATE TYPE "public"."tipo_reclamacao" AS ENUM('mensalidade', 'professores', 'infraestrutura', 'comunicacao', 'atendimento', 'ensino', 'transporte', 'alimentacao', 'seguranca', 'outros');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reclamacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"tipo" "tipo_reclamacao" NOT NULL,
	"quantidade" integer NOT NULL,
	"mes_referencia" integer NOT NULL,
	"ano_referencia" integer NOT NULL,
	"plataforma_origem" text NOT NULL,
	"coletado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reclamacoes" ADD CONSTRAINT "reclamacoes_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
