import React, { use, useEffect, useState } from 'react';
// Note: Update this service import based on your project structure
// import { retrieveComplaint } from '../../services/ComplaintServices';
import {
  FileText,
  Users,
  CheckCircle,
  UserPlus,
  Megaphone,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  ArrowUpRight,
  Settings,
  Bell,
  Activity,
  UserCheck,
  AlertCircle,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

const AdminDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    unassigned: 0,
    inProgress: 0,
    highPriority: 0,
    avgResolutionTime: 0
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const data = await retrieveComplaint();
        setComplaints(data);

        // Calculate statistics
        const total = data.length;
        const resolved = data.filter(c => c.status === 'resolved').length;
        const unassigned = data.filter(c => !c.assignedTo).length;
        const inProgress = data.filter(c => c.status === 'in-progress').length;
        const active = unassigned + inProgress;
        const highPriority = data.filter(c => c.priority === 'high' && c.status !== 'resolved').length;

        // Calculate average resolution time
        const resolvedComplaints = data.filter(c => c.status === 'resolved' && c.created_at && c.resolved_at);
        const avgTime = resolvedComplaints.length > 0
          ? resolvedComplaints.reduce((acc, curr) => {
            const created = new Date(curr.created_at);
            const resolved = new Date(curr.resolved_at);
            return acc + (resolved - created) / (1000 * 60 * 60 * 24); // Convert to days
          }, 0) / resolvedComplaints.length
          : 0;

        setStats({
          total,
          active,
          resolved,
          unassigned,
          inProgress,
          highPriority,
          avgResolutionTime: avgTime.toFixed(1)
        });
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchComplaints, 300000);
    return () => clearInterval(interval);
  }, []);


  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned': return 'bg-red-50/90 text-red-700 border-red-100';
      case 'pending': return 'bg-amber-50/90 text-amber-700 border-amber-100';
      case 'in-progress': return 'bg-emerald-50/90 text-emerald-700 border-emerald-100';
      case 'resolved': return 'bg-green-50/90 text-green-700 border-green-100';
      default: return 'bg-gray-50/90 text-gray-700 border-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50/80 border border-red-100';
      case 'medium': return 'text-amber-600 bg-amber-50/80 border border-amber-100';
      case 'low': return 'text-emerald-600 bg-emerald-50/80 border border-emerald-100';
      default: return 'text-gray-600 bg-gray-50/80 border border-gray-100';
    }
  };

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.total.toString(),
      subtitle: `${stats.unassigned} unassigned, ${stats.inProgress} in progress`,
      icon: FileText,
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-50/90',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Active Complaints',
      value: stats.active.toString(),
      subtitle: `${stats.unassigned} unassigned, ${stats.inProgress} in progress`,
      icon: Activity,
      color: 'from-green-400 to-teal-500',
      bgColor: 'bg-green-50/90',
      textColor: 'text-green-700'
    },
    {
      title: 'Resolved Complaints',
      value: stats.resolved.toString(),
      subtitle: `${((stats.resolved / stats.total) * 100).toFixed(1)}% resolution rate`,
      icon: CheckCircle,
      color: 'from-teal-400 to-emerald-500',
      bgColor: 'bg-teal-50/90',
      textColor: 'text-teal-700'
    },
    {
      title: 'High Priority',
      value: stats.highPriority.toString(),
      subtitle: 'Pending urgent complaints',
      icon: AlertTriangle,
      color: 'from-rose-300 to-red-300',
      bgColor: 'bg-rose-50/90',
      textColor: 'text-rose-700'
    }
  ];



  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-emerald-800 font-['Inter']">Good Morning,</h1>
            <p className="text-emerald-600 mt-1 font-['Inter']">Hope you are doing well!</p>
          </div>
          <div className="flex items-center space-x-3">

            <button className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-500 hover:to-green-600 transition-all duration-200 shadow-md font-['Inter']">
              <Download className="w-4 h-4 inline mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-6 hover:shadow-xl transition-all duration-300 card-hover">
                <div className="flex items-center justify-between">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-semibold text-emerald-800 font-['Inter']">{stat.value}</span>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-emerald-800 font-['Inter']">{stat.title}</h3>
                  <p className="text-sm text-emerald-600 mt-1 font-['Inter']">{stat.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Complaints */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-emerald-100/30">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Inter']">Latest Complaints (All Users)</h2>
              <button className="text-gray-600 hover:text-gray-800 font-medium text-sm font-['Inter'] flex items-center group">
                View all <ArrowUpRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100/30">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No complaints found</p>
              </div>
            ) : complaints
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .filter((complaint) => complaint.status !== "resolved")
              .map((complaint) => (
                <div key={complaint.id} className="p-6 hover:bg-white/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 font-['Inter']">{complaint.title}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 font-['Inter']">{complaint.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center font-['Inter']">
                          <MapPin className="w-3 h-3 mr-1" />
                          {complaint.location}
                        </span>
                        <span className="flex items-center font-['Inter']">
                          <Clock className="w-3 h-3 mr-1" />
                          {complaint.date}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority} priority
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center font-['Inter']">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Reported by: {complaint.user}
                        </span>
                        {complaint.assignedTo && (
                          <span className="flex items-center font-['Inter']">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Assigned: {complaint.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50/40 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50/40 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-emerald-100/30">
              <h2 className="text-xl font-semibold text-emerald-900 font-['Inter']">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full p-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl group">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium font-['Inter'] text-lg">Assign Complaint</div>
                    <div className="text-sm text-white/90 font-['Inter']">Allocate to staff/department</div>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-xl hover:from-green-500 hover:to-teal-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl group">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium font-['Inter'] text-lg">Add Announcement</div>
                    <div className="text-sm text-white/90 font-['Inter']">Create system notice</div>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 bg-gradient-to-r from-teal-400 to-emerald-500 text-white rounded-xl hover:from-teal-500 hover:to-emerald-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl group">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium font-['Inter'] text-lg">Manage Users</div>
                    <div className="text-sm text-white/90 font-['Inter']">User & staff management</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-emerald-100/30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-emerald-900 font-['Inter']">System Performance</h2>
                <select
                  className="text-sm bg-emerald-50/50 border border-emerald-200/40 rounded-lg px-3 py-1.5 font-['Inter'] text-emerald-700"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-600 font-['Inter']">Total complaints</span>
                  <span className="text-sm font-medium text-emerald-800 font-['Inter']">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-600 font-['Inter']">Complaints resolved</span>
                  <span className="text-sm font-medium text-emerald-800 font-['Inter']">{stats.resolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-600 font-['Inter']">Average resolution time</span>
                  <span className="text-sm font-medium text-emerald-800 font-['Inter']">{stats.avgResolutionTime} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-600 font-['Inter']">Pending high-priority</span>
                  <span className="text-sm font-medium text-red-600 font-['Inter']">{stats.highPriority}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-100/30">
                <div className="flex items-center text-sm text-emerald-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="font-['Inter']">
                    Resolution rate: {((stats.resolved / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;