/*
  # Fix RLS policies for project documents soft delete

  1. Security Updates
    - Drop all existing conflicting policies for project_documents table
    - Create clean, non-conflicting policies for all operations
    - Ensure soft delete operations (updating is_active to false) work properly
    - Maintain proper security for authenticated users

  2. Policy Changes
    - SELECT: Allow authenticated users to read all project documents
    - INSERT: Allow authenticated users to create project documents
    - UPDATE: Allow authenticated users to update project documents including soft deletes
    - DELETE: Allow authenticated users to perform hard deletes if needed
*/

-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "Authenticated users can read project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can insert project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can update project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can update project documents including soft" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can update their projects" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can delete project documents" ON project_documents;

-- Create clean policies for all operations
CREATE POLICY "Allow authenticated users to select project documents"
  ON project_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert project documents"
  ON project_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update project documents"
  ON project_documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete project documents"
  ON project_documents
  FOR DELETE
  TO authenticated
  USING (true);