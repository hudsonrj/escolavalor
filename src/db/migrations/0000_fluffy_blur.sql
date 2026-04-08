DO $$ BEGIN
 CREATE TYPE "public"."competicao" AS ENUM('obmep', 'obf', 'obq', 'oba');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."fonte_nota" AS ENUM('enem', 'ideb', 'aprovacao_univ');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."nivel_medalha" AS ENUM('ouro', 'prata', 'bronze', 'mencao');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_escola" AS ENUM('publica', 'privada', 'federal', 'tecnica');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "escolas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cnpj" text NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_escola" NOT NULL,
	"uf" char(2) NOT NULL,
	"municipio" text NOT NULL,
	"lat" numeric(10, 8),
	"lng" numeric(11, 8),
	"mensalidade_anual" numeric(10, 2),
	"mensalidade_ano_ref" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "escolas_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "historico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"icb" numeric(10, 2),
	"score_composto" numeric(4, 2) NOT NULL,
	"referencia_ano" integer NOT NULL,
	"snapshot_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"fonte" "fonte_nota" NOT NULL,
	"valor_normalizado" numeric(4, 2) NOT NULL,
	"valor_original" numeric(10, 2) NOT NULL,
	"escala_original" text NOT NULL,
	"ano_referencia" integer NOT NULL,
	"coletado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "olimpiadas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"competicao" "competicao" NOT NULL,
	"nivel" "nivel_medalha" NOT NULL,
	"pontos" numeric(3, 1) NOT NULL,
	"edicao" integer NOT NULL,
	"aluno_anonimizado" text NOT NULL,
	"coletado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escola_id" uuid NOT NULL,
	"score_composto" numeric(4, 2) NOT NULL,
	"icb" numeric(10, 2),
	"peso_enem" numeric(3, 2) NOT NULL,
	"peso_olimpiadas" numeric(3, 2) NOT NULL,
	"peso_aprovacao" numeric(3, 2) NOT NULL,
	"peso_ideb" numeric(3, 2) NOT NULL,
	"calculado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scores_escola_id_unique" UNIQUE("escola_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico" ADD CONSTRAINT "historico_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notas" ADD CONSTRAINT "notas_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "olimpiadas" ADD CONSTRAINT "olimpiadas_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scores" ADD CONSTRAINT "scores_escola_id_escolas_id_fk" FOREIGN KEY ("escola_id") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
