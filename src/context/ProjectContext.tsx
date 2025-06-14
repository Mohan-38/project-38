import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, Inquiry, Order, ProjectDocument } from '../types';
import { sendDocumentDelivery, generateDownloadInstructions } from '../utils/email';

type ProjectContextType = {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  projectDocuments: ProjectDocument[];
  addProjectDocument: (document: Omit<ProjectDocument, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProjectDocument: (id: string, document: Partial<ProjectDocument>) => Promise<void>;
  deleteProjectDocument: (id: string) => Promise<void>;
  getProjectDocuments: (projectId: string) => ProjectDocument[];
  getDocumentsByReviewStage: (projectId: string, reviewStage: string) => ProjectDocument[];
  sendProjectDocuments: (orderId: string, customerEmail: string, customerName: string) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

// Utility function to convert camelCase to snake_case
const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Utility function to convert object keys from camelCase to snake_case
const convertKeysToSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = toSnakeCase(key);
      acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);

  // Load projects from Supabase on mount
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    };

    fetchProjects();

    // Subscribe to changes
    const projectsSubscription = supabase
      .channel('projects_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      projectsSubscription.unsubscribe();
    };
  }, []);

  // Load inquiries from Supabase
  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
        return;
      }

      setInquiries(data || []);
    };

    fetchInquiries();

    // Subscribe to changes
    const inquiriesSubscription = supabase
      .channel('inquiries_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, (payload) => {
        fetchInquiries();
      })
      .subscribe();

    return () => {
      inquiriesSubscription.unsubscribe();
    };
  }, []);

  // Load orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    };

    fetchOrders();

    // Subscribe to changes
    const ordersSubscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);

  // Load project documents from Supabase
  useEffect(() => {
    const fetchProjectDocuments = async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project documents:', error);
        return;
      }

      setProjectDocuments(data || []);
    };

    fetchProjectDocuments();

    // Subscribe to changes
    const documentsSubscription = supabase
      .channel('project_documents_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_documents' }, (payload) => {
        fetchProjectDocuments();
      })
      .subscribe();

    return () => {
      documentsSubscription.unsubscribe();
    };
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    // Remove imageUpload from the project data before sending to Supabase
    const { imageUpload, ...projectData } = project as any;
    
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase(projectData);

    const { data, error } = await supabase
      .from('projects')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      return;
    }

    setProjects(prevProjects => [...prevProjects, data]);
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    // Remove imageUpload from the update data before sending to Supabase
    const { imageUpload, ...dataToUpdate } = updatedData as any;
    
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase(dataToUpdate);

    const { error } = await supabase
      .from('projects')
      .update(snakeCaseData)
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
      return;
    }

    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id
          ? { ...project, ...updatedData }
          : project
      )
    );
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return;
    }

    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  };

  const addInquiry = async (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase({
      clientName: inquiry.name,
      email: inquiry.email,
      projectType: inquiry.projectType,
      budget: inquiry.budget,
      message: inquiry.message
    });

    const { data, error } = await supabase
      .from('inquiries')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding inquiry:', error);
      return;
    }

    setInquiries(prevInquiries => [...prevInquiries, data]);
  };

  const deleteInquiry = async (id: string) => {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inquiry:', error);
      return;
    }

    setInquiries(prevInquiries => prevInquiries.filter(inquiry => inquiry.id !== id));
  };

  const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase(order);

    const { data, error } = await supabase
      .from('orders')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }

    setOrders(prevOrders => [...prevOrders, data]);

    // Automatically send document delivery email after successful order
    // Use the newly created order data directly instead of searching in state
    try {
      await sendProjectDocumentsForOrder(data, order.customerEmail, order.customerName);
    } catch (emailError) {
      console.error('Error sending document delivery email:', emailError);
      // Don't throw here as the order was successful, just log the email error
    }

    return data;
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating order status:', error);
      return;
    }

    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting order:', error);
      return;
    }

    setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
  };

  // Project Documents functions
  const addProjectDocument = async (document: Omit<ProjectDocument, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('project_documents')
      .insert([document])
      .select()
      .single();

    if (error) {
      console.error('Error adding project document:', error);
      throw error;
    }

    setProjectDocuments(prevDocs => [...prevDocs, data]);
  };

  const updateProjectDocument = async (id: string, document: Partial<ProjectDocument>) => {
    const { error } = await supabase
      .from('project_documents')
      .update({ ...document, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating project document:', error);
      return;
    }

    setProjectDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === id
          ? { ...doc, ...document }
          : doc
      )
    );
  };

  const deleteProjectDocument = async (id: string) => {
    const { error } = await supabase
      .from('project_documents')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting project document:', error);
      return;
    }

    setProjectDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
  };

  const getProjectDocuments = (projectId: string): ProjectDocument[] => {
    return projectDocuments.filter(doc => doc.project_id === projectId && doc.is_active);
  };

  const getDocumentsByReviewStage = (projectId: string, reviewStage: string): ProjectDocument[] => {
    return projectDocuments.filter(
      doc => doc.project_id === projectId && 
             doc.review_stage === reviewStage && 
             doc.is_active
    );
  };

  // Helper function to send documents for a specific order object
  const sendProjectDocumentsForOrder = async (order: Order, customerEmail: string, customerName: string) => {
    try {
      // Get all documents for the project
      const documents = getProjectDocuments(order.projectId);
      
      if (documents.length === 0) {
        console.log('No documents found for project, skipping email');
        return;
      }

      // Format documents for email
      const formattedDocuments = documents.map(doc => ({
        name: doc.name,
        url: doc.url,
        category: doc.document_category,
        review_stage: doc.review_stage
      }));

      // Send document delivery email
      await sendDocumentDelivery({
        project_title: order.projectTitle,
        customer_name: customerName,
        customer_email: customerEmail,
        order_id: order.id,
        documents: formattedDocuments,
        access_expires: 'Never (lifetime access)'
      });

      console.log('Document delivery email sent successfully');
    } catch (error) {
      console.error('Error sending project documents:', error);
      throw error;
    }
  };

  const sendProjectDocuments = async (orderId: string, customerEmail: string, customerName: string) => {
    try {
      // Find the order to get project details
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      await sendProjectDocumentsForOrder(order, customerEmail, customerName);
    } catch (error) {
      console.error('Error sending project documents:', error);
      throw error;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        inquiries,
        addInquiry,
        deleteInquiry,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        projectDocuments,
        addProjectDocument,
        updateProjectDocument,
        deleteProjectDocument,
        getProjectDocuments,
        getDocumentsByReviewStage,
        sendProjectDocuments,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};