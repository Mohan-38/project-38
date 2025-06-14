import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  MessageSquare, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  BarChart2, 
  ArrowUpRight 
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';

const AdminDashboardPage = () => {
  const { projects, inquiries, orders } = useProjects();
  const { user } = useAuth();
  
  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const newInquiries = inquiries.length;
  
  // Format revenue in Indian Rupees
  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalRevenue);
  
  // Generate dummy chart data
  const monthlyRevenue = Array.from({ length: 12 }, () => Math.floor(Math.random() * 2000));
  const maxRevenue = Math.max(...monthlyRevenue);
  
  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200">Welcome back, {user?.email}</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your projects today.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Projects</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200">{projects.length}</h3>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>Active and selling</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">New Inquiries</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200">{newInquiries}</h3>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900 rounded-lg">
                <MessageSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center">
              <span>Requires response</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pending Orders</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200">{pendingOrders}</h3>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 flex items-center">
              <span>Waiting fulfillment</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200">{formattedRevenue}</h3>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>From {orders.length} orders</span>
            </div>
          </div>
        </div>
        
        {/* Revenue Chart and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Revenue Overview</h3>
              <select className="text-sm border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                <option>This Year</option>
                <option>Last Year</option>
                <option>Last 6 Months</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end space-x-2">
              {monthlyRevenue.map((value, index) => {
                const percentage = (value / maxRevenue) * 100;
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all duration-200" 
                      style={{ height: `${percentage}%` }}
                    ></div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{months[index]}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Recent Inquiries */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Recent Inquiries</h3>
              <Link 
                to="/admin/inquiries"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {inquiries.slice(0, 3).map((inquiry) => (
                <div key={inquiry.id} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-slate-900 dark:text-slate-200">{inquiry.name}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(inquiry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{inquiry.projectType} Project</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{inquiry.message}</p>
                </div>
              ))}
              
              {inquiries.length === 0 && (
                <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                  No inquiries yet
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link 
            to="/admin/projects"
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg mr-4">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-200">Manage Projects</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add, edit, or remove projects</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/inquiries"
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-3 bg-amber-50 dark:bg-amber-900 rounded-lg mr-4">
              <MessageSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-200">View Inquiries</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review and respond to messages</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/orders"
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg mr-4">
              <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-200">Manage Orders</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track and fulfill project orders</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;