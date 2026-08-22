-- Course instructions are authored and rendered as Markdown, not JSON documents.
ALTER TABLE public.course_labs
  ALTER COLUMN instructions TYPE TEXT USING instructions::text;
