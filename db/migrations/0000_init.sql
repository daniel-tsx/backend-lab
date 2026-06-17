CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"domain" text NOT NULL,
	"difficulty" text NOT NULL,
	"problem_statement" text DEFAULT '' NOT NULL,
	"functional_requirements" text[] DEFAULT '{}'::text[] NOT NULL,
	"non_functional_requirements" text[] DEFAULT '{}'::text[] NOT NULL,
	"constraints" text[] DEFAULT '{}'::text[] NOT NULL,
	"traffic_assumptions" text DEFAULT '' NOT NULL,
	"data_model" text DEFAULT '' NOT NULL,
	"api_design" text DEFAULT '' NOT NULL,
	"architecture" text DEFAULT '' NOT NULL,
	"scaling_strategy" text DEFAULT '' NOT NULL,
	"reliability_strategy" text DEFAULT '' NOT NULL,
	"security_strategy" text DEFAULT '' NOT NULL,
	"observability_strategy" text DEFAULT '' NOT NULL,
	"cost_considerations" text DEFAULT '' NOT NULL,
	"tradeoffs" text DEFAULT '' NOT NULL,
	"final_notes" text DEFAULT '' NOT NULL,
	"review_scores" jsonb,
	"status" text DEFAULT 'not-started' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"status" text DEFAULT 'not-started' NOT NULL,
	"importance" text DEFAULT 'medium' NOT NULL,
	"mental_model" text DEFAULT '' NOT NULL,
	"how_it_works" text DEFAULT '' NOT NULL,
	"when_to_use" text DEFAULT '' NOT NULL,
	"when_not_to_use" text DEFAULT '' NOT NULL,
	"common_mistakes" text DEFAULT '' NOT NULL,
	"tradeoffs" text DEFAULT '' NOT NULL,
	"real_world_examples" text DEFAULT '' NOT NULL,
	"related_concept_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"prerequisite_concept_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"question" text DEFAULT '' NOT NULL,
	"short_answer" text DEFAULT '' NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"comparison_criteria" text[] DEFAULT '{}'::text[] NOT NULL,
	"recommendation_rules" text DEFAULT '' NOT NULL,
	"examples" text DEFAULT '' NOT NULL,
	"related_concept_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"related_lab_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagrams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"diagram_type" text NOT NULL,
	"related_concept_id" uuid,
	"related_case_study_id" uuid,
	"related_project_id" uuid,
	"mermaid_code" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glossary_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" text NOT NULL,
	"slug" text NOT NULL,
	"definition" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"example" text DEFAULT '' NOT NULL,
	"related_concept_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"common_confusion" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"related_concept_id" uuid,
	"module_id" uuid,
	"difficulty" text NOT NULL,
	"lab_type" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"scenario" text DEFAULT '' NOT NULL,
	"requirements" text DEFAULT '' NOT NULL,
	"starter_code" text DEFAULT '' NOT NULL,
	"expected_solution" text DEFAULT '' NOT NULL,
	"hints" text[] DEFAULT '{}'::text[] NOT NULL,
	"success_criteria" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'not-started' NOT NULL,
	"time_spent_minutes" integer DEFAULT 0 NOT NULL,
	"confidence_before" integer,
	"confidence_after" integer,
	"notes" text DEFAULT '' NOT NULL,
	"notebook" text DEFAULT '' NOT NULL,
	"things_got_wrong" text DEFAULT '' NOT NULL,
	"what_learned" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"concepts_studied" text[] DEFAULT '{}'::text[] NOT NULL,
	"labs_completed" text[] DEFAULT '{}'::text[] NOT NULL,
	"time_spent_minutes" integer DEFAULT 0 NOT NULL,
	"confidence_change" integer DEFAULT 0 NOT NULL,
	"blockers" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"next_step" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"key_takeaways" text[] DEFAULT '{}'::text[] NOT NULL,
	"questions_to_answer" text[] DEFAULT '{}'::text[] NOT NULL,
	"common_misconceptions" text[] DEFAULT '{}'::text[] NOT NULL,
	"practical_checklist" text[] DEFAULT '{}'::text[] NOT NULL,
	"own_words" text DEFAULT '' NOT NULL,
	"project_application" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'not-started' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"concept_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"module_type" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"estimated_hours" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'not-started' NOT NULL,
	"outcome" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_name" text NOT NULL,
	"project_type" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"current_architecture" text DEFAULT '' NOT NULL,
	"backend_risks" text DEFAULT '' NOT NULL,
	"concepts_used" text[] DEFAULT '{}'::text[] NOT NULL,
	"concepts_to_learn" text[] DEFAULT '{}'::text[] NOT NULL,
	"architecture_notes" text DEFAULT '' NOT NULL,
	"improvement_ideas" text DEFAULT '' NOT NULL,
	"next_backend_action" text DEFAULT '' NOT NULL,
	"related_decision_guide_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"related_case_study_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"related_concept_id" uuid,
	"related_lesson_id" uuid,
	"question" text NOT NULL,
	"answer" text DEFAULT '' NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"next_review_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"review_count" integer DEFAULT 0 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"confidence" text DEFAULT 'low' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"language" text NOT NULL,
	"category" text NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"use_case" text DEFAULT '' NOT NULL,
	"related_concept_id" uuid,
	"related_lab_id" uuid,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_related_concept_id_concepts_id_fk" FOREIGN KEY ("related_concept_id") REFERENCES "public"."concepts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_related_case_study_id_case_studies_id_fk" FOREIGN KEY ("related_case_study_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labs" ADD CONSTRAINT "labs_related_concept_id_concepts_id_fk" FOREIGN KEY ("related_concept_id") REFERENCES "public"."concepts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labs" ADD CONSTRAINT "labs_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_concepts" ADD CONSTRAINT "module_concepts_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_concepts" ADD CONSTRAINT "module_concepts_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_related_case_study_id_case_studies_id_fk" FOREIGN KEY ("related_case_study_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_cards" ADD CONSTRAINT "review_cards_related_concept_id_concepts_id_fk" FOREIGN KEY ("related_concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_cards" ADD CONSTRAINT "review_cards_related_lesson_id_lessons_id_fk" FOREIGN KEY ("related_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_related_concept_id_concepts_id_fk" FOREIGN KEY ("related_concept_id") REFERENCES "public"."concepts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_related_lab_id_labs_id_fk" FOREIGN KEY ("related_lab_id") REFERENCES "public"."labs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "concepts_slug_idx" ON "concepts" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "decision_guides_slug_idx" ON "decision_guides" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "glossary_terms_slug_idx" ON "glossary_terms" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "labs_slug_idx" ON "labs" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_slug_idx" ON "lessons" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "modules_slug_idx" ON "modules" USING btree ("slug");