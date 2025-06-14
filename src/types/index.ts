export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
  imageUpload: File | null;
  features: string[];
  technical_details?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  projectId: string;
  projectTitle: string;
  customerName: string;
  customerEmail: string;
  price: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  review_stage: 'review_1' | 'review_2' | 'review_3';
  document_category: 'presentation' | 'document' | 'report' | 'other';
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewStage {
  stage: 'review_1' | 'review_2' | 'review_3';
  name: string;
  description: string;
  documents: ProjectDocument[];
}