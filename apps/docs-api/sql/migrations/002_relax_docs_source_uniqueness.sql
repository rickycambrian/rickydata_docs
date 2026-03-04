DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'docs_source_repo_source_path_source_commit_doc_type_key'
  ) THEN
    ALTER TABLE docs DROP CONSTRAINT docs_source_repo_source_path_source_commit_doc_type_key;
  END IF;
END $$;
