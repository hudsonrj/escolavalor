DO $$ BEGIN
 CREATE TYPE "public"."categoria_avaliacao" AS ENUM('infraestrutura', 'ensino', 'atendimento', 'comunicacao', 'seguranca', 'alimentacao', 'atividades_extracurriculares', 'custo_beneficio');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."plataforma_avaliacao" AS ENUM('reclame_aqui', 'google', 'facebook', 'trustpilot', 'escola_no_ranking');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "avaliacoes_externas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"plataforma" "plataforma_avaliacao" NOT NULL,
	"categoria" "categoria_avaliacao" NOT NULL,
	"nota_media" numeric(3, 2) NOT NULL,
	"total_avaliacoes" integer NOT NULL,
	"mes_referencia" integer NOT NULL,
	"ano_referencia" integer NOT NULL,
	"coletado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avaliacoes_externas" ADD CONSTRAINT "avaliacoes_externas_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
