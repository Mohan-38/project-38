import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Tag, 
  Calendar, 
  Info, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, getDocumentsByReviewStage } = useProjects();
  const { isAuthenticated } = useAuth();
  const project = projects.find(p => p.id === id);
  const [expandedReviewStage, setExpandedReviewStage] = useState<string | null>(null);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-16 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-4">Project Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The project you are looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/projects" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'iot':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'blockchain':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'web':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Format price in Indian Rupees
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(project.price);

  const handlePurchaseClick = () => {
    navigate(`/checkout/${project.id}`);
  };

  const reviewStages = [
    { 
      value: 'review_1', 
      label: 'Review 1', 
      description: 'Initial project review and requirements' 
    },
    { 
      value: 'review_2', 
      label: 'Review 2', 
      description: 'Mid-project review and progress assessment' 
    },
    { 
      value: 'review_3', 
      label: 'Review 3', 
      description: 'Final review and project completion' 
    }
  ];

  const toggleReviewStage = (stage: string) => {
    setExpandedReviewStage(expandedReviewStage === stage ? null : stage);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get document counts for preview (only show counts, not actual files)
  const getDocumentPreview = (stage: string) => {
    const documents = getDocumentsByReviewStage(project.id, stage);
    const categories = {
      presentation: documents.filter(doc => doc.document_category === 'presentation').length,
      document: documents.filter(doc => doc.document_category === 'document').length,
      report: documents.filter(doc => doc.document_category === 'report').length,
      other: documents.filter(doc => doc.document_category === 'other').length
    };
    
    return {
      total: documents.length,
      categories,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0)
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to projects
          </button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          {/* Project Image */}
          <div className="relative h-64 md:h-80 bg-slate-200 dark:bg-slate-700">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex space-x-2">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(project.category)}`}
              >
                <Tag className="mr-1.5 h-4 w-4" />
                {project.category}
              </span>
              
              {project.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-700 text-amber-800 dark:text-amber-200">
                  Featured
                </span>
              )}
            </div>
          </div>
          
          {/* Project Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="lg:w-2/3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-200 mb-4">{project.title}</h1>
                
                <div className="flex items-center text-slate-500 dark:text-slate-400 mb-6">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Last updated: {new Date(project.updated_at || Date.now()).toLocaleDateString()}</span>
                </div>
                
                <div className="prose max-w-none text-slate-700 dark:text-slate-300 mb-8">
                  <p className="mb-4 text-lg">{project.description}</p>
                  
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3">Features</h2>
                  <ul className="space-y-2 mb-6">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {project.technical_details && (
                    <>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3">Technical Details</h2>
                      <p className="mb-6">{project.technical_details}</p>
                    </>
                  )}
                </div>

                {/* Project Documents Section - Preview Only */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-4">Project Documents</h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">Documents Available After Purchase</p>
                        <p>Complete project documentation will be delivered via email upon purchase, organized by review stages.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {reviewStages.map((stage) => {
                      const preview = getDocumentPreview(stage.value);
                      const isExpanded = expandedReviewStage === stage.value;
                      
                      return (
                        <div key={stage.value} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                          <button
                            onClick={() => toggleReviewStage(stage.value)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <div>
                              <h3 className="font-medium text-slate-900 dark:text-slate-200">
                                {stage.label}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {stage.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                                {preview.total} docs
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </button>
                          
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700">
                              {preview.total === 0 ? (
                                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No documents available for this review stage</p>
                                </div>
                              ) : (
                                <div className="space-y-3 mt-3">
                                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">
                                      Document Summary
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-slate-600 dark:text-slate-400">Total Documents:</span>
                                        <span className="ml-2 font-medium text-slate-900 dark:text-slate-200">{preview.total}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-600 dark:text-slate-400">Total Size:</span>
                                        <span className="ml-2 font-medium text-slate-900 dark:text-slate-200">{formatFileSize(preview.totalSize)}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Document Types:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {preview.categories.presentation > 0 && (
                                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                                            {preview.categories.presentation} Presentation{preview.categories.presentation > 1 ? 's' : ''}
                                          </span>
                                        )}
                                        {preview.categories.document > 0 && (
                                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                            {preview.categories.document} Document{preview.categories.document > 1 ? 's' : ''}
                                          </span>
                                        )}
                                        {preview.categories.report > 0 && (
                                          <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                                            {preview.categories.report} Report{preview.categories.report > 1 ? 's' : ''}
                                          </span>
                                        )}
                                        {preview.categories.other > 0 && (
                                          <span className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                                            {preview.categories.other} Other
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                    <div className="flex items-start">
                                      <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                                      <div className="text-sm text-amber-800 dark:text-amber-300">
                                        <p className="font-medium">Purchase to Access</p>
                                        <p className="text-xs mt-1">Documents will be delivered via email with download links</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Project Purchase Card */}
              <div className="lg:w-1/3">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-sm sticky top-24">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-200 mb-4">
                    {formattedPrice}
                  </div>
                  
                  <button 
                    onClick={handlePurchaseClick}
                    className="w-full mb-4 inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Purchase Project
                  </button>
                  
                  <Link 
                    to="/contact" 
                    className="w-full inline-flex items-center justify-center px-5 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors duration-200"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Request Customization
                  </Link>
                  
                  <div className="mt-6">
                    <div className="flex items-start mb-4">
                      <Info className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <p className="font-medium mb-1">What you'll receive:</p>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                          <li>Complete source code</li>
                          <li>Documentation</li>
                          <li>Installation guide</li>
                          <li>Support via email</li>
                          <li>Project review documents</li>
                          <li>Lifetime access to downloads</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;