import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Note: Update these service imports based on your project structure
// import {
//   reportLostItem,
//   reportFoundItem,
// } from "../../services/LostFoundServices";
// import {
//   sendComplaint,
//   retrieveComplaint,
// } from "../../services/ComplaintServices";
// import {
//   getUserDetails,
//   getUserComplaints,
//   getUserLostItems,
// } from "../../services/UserServices";
import "./Dashboard.css";
import Modal from "../components/Modal";

import {
  FileText,
  Search,
  CheckCircle,
  Plus,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  ArrowUpRight,
  X,
  Star,
  Loader2,
  Package,
  PackageOpen,
} from "lucide-react";

const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
    />
  </div>
);

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
      {label} {required && "*"}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
    />
  </div>
);

const FormSelect = ({ label, name, value, onChange, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
      {label} {required && "*"}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
    >
      {children}
    </select>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [userComplaints, setUserComplaints] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportType, setReportType] = useState("lost");
  const [complaintFormData, setComplaintFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: "medium",
    category: "infrastructure",
  });

  const [lostFoundFormData, setLostFoundFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "Personal Items",
    contactDetails: "",
    date: "",
    distinguishingFeatures: "",
  });

  const [feedbackFormData, setFeedbackFormData] = useState({
    subject: "",
    category: "general",
    rating: 5,
    message: "",
    contactEmail: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    let userInfo = {};

    try {
      userInfo = {
        email: localStorage.getItem("email") || "",
        joinDate: localStorage.getItem("joinDate") || "",
        name: localStorage.getItem("name") || "",
        resolvedComplaints: localStorage.getItem("resolvedComplaints") || 0,
        role: localStorage.getItem("role") || "",
        rollNumber: localStorage.getItem("rollNumber") || "",
        token: localStorage.getItem("token") || "",
        totalComplaints: localStorage.getItem("totalComplaints") || 0,
      };
    } catch (e) {
      console.error("Error building user info:", e);
      userInfo = {};
    }

    if (!token || !userInfo.rollNumber) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const userId = userInfo.rollNumber;

        const [userDetailsData, userComplaintsData, userLostItemsData] =
          await Promise.all([
            getUserDetails(userId),
            getUserComplaints(userId),
            getUserLostItems(userId),
          ]);

        if (userDetailsData) {
          setUserDetails(userDetailsData);
        }
        if (Array.isArray(userComplaintsData)) {
          setUserComplaints(userComplaintsData);
        }
        if (Array.isArray(userLostItemsData)) {
          setLostItems(userLostItemsData);
        }

        const complaintsData = await retrieveComplaint();
        if (Array.isArray(complaintsData)) {
          setComplaints(complaintsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const stats = [
    {
      title: "My Complaints",
      value: userComplaints?.length.toString() || "0",
      subtitle: `${userComplaints?.filter((c) => c.status === "pending").length || 0
        } pending, ${userComplaints?.filter((c) => c.status === "in-progress").length || 0
        } in progress`,
      icon: FileText,
      color: "from-emerald-400 to-green-500",
      bgColor: "bg-emerald-50/90",
      textColor: "text-emerald-700",
    },
    {
      title: "Lost & Found",
      value: lostItems?.length.toString() || "0",
      subtitle: `${lostItems?.filter((item) => !item.isResolved).length || 0
        } active, ${lostItems?.filter((item) => item.isResolved).length || 0
        } resolved`,
      icon: Search,
      color: "from-green-400 to-teal-500",
      bgColor: "bg-green-50/90",
      textColor: "text-green-700",
    },
    {
      title: "Resolved Cases",
      value: (
        userComplaints?.filter((c) => c.status === "resolved").length || 0
      ).toString(),
      subtitle: "All time",
      icon: CheckCircle,
      color: "from-teal-400 to-emerald-500",
      bgColor: "bg-teal-50/90",
      textColor: "text-teal-700",
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50/90 text-amber-700 border-amber-200/60";
      case "in-progress":
        return "bg-emerald-50/90 text-emerald-700 border-emerald-200/60";
      case "resolved":
        return "bg-green-50/90 text-green-700 border-green-200/60";
      default:
        return "bg-gray-50/90 text-gray-700 border-gray-200/60";
    }
  };

  const handleComplaintModalOpen = () => {
    setIsComplaintModalOpen(true);
  };

  const handleComplaintModalClose = () => {
    if (isSubmitting) return;
    setIsComplaintModalOpen(false);
    setComplaintFormData({
      title: "",
      description: "",
      location: "",
      priority: "medium",
      category: "infrastructure",
    });
  };

  const handleComplaintInputChange = (e) => {
    const { name, value } = e.target;
    setComplaintFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isOnlyWhitespace = (text) => !text.trim();

  const isOnlyNumbers = (text) => /^[0-9]+$/.test(text.trim());


  const handleComplaintSubmit = async (e) => {

    const { title, description } = complaintFormData;

    if (isOnlyWhitespace(title) || isOnlyWhitespace(description)) {
      alert("Title and Description cannot be empty or only spaces.");
      return;
    }

    if (isOnlyNumbers(title) || isOnlyNumbers(description)) {
      alert("Title and Description cannot contain only numbers.");
      return;
    }

    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("token") || "{}");
      if (!userInfo.rollNumber) {
        throw new Error("User not authenticated");
      }

      const payload = {
        user_id: userInfo.rollNumber,
        ...complaintFormData,
        status: "pending",
      };

      await sendComplaint(payload);
      handleComplaintModalClose();

      const updatedComplaints = await getUserComplaints(userInfo.rollNumber);
      if (Array.isArray(updatedComplaints)) {
        setUserComplaints(updatedComplaints);
      }
    } catch (err) {
      console.error("Error submitting complaint:", err);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLostFoundModalOpen = () => {
    setIsLostFoundModalOpen(true);
  };

  const handleLostFoundModalClose = () => {
    if (isSubmitting) return;
    setIsLostFoundModalOpen(false);
    setReportType("lost");
    setLostFoundFormData({
      title: "",
      description: "",
      location: "",
      category: "Personal Items",
      contactDetails: "",
      date: "",
      distinguishingFeatures: "",
    });
  };

  const handleLostFoundInputChange = (e) => {
    const { name, value } = e.target;
    setLostFoundFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLostFoundSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("token") || "{}");
      if (!userInfo.rollNumber) {
        throw new Error("User not authenticated");
      }

      let payload = {
        user_id: userInfo.rollNumber,
        title: lostFoundFormData.title,
        description: lostFoundFormData.description,
        location: lostFoundFormData.location,
        category: lostFoundFormData.category,
        contactDetails: lostFoundFormData.contactDetails,
      };

      if (reportType === "lost") {
        payload.dateLost = lostFoundFormData.date;
        payload.distinguishingFeatures =
          lostFoundFormData.distinguishingFeatures;
        await reportLostItem(payload);
      } else {
        payload.dateFound = lostFoundFormData.date;
        await reportFoundItem(payload);
      }

      alert(`Successfully reported ${reportType} item!`);
      handleLostFoundModalClose();

      const updatedLostItems = await getUserLostItems(userInfo.rollNumber);
      if (Array.isArray(updatedLostItems)) {
        setLostItems(updatedLostItems);
      }
    } catch (err) {
      console.error(`Failed to report ${reportType} item:`, err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-emerald-900 font-['Inter']">
              Welcome back, {userDetails?.name || "User"}
            </h1>
            <div className="mt-2 text-emerald-600">
              <p className="font-['Inter'] text-lg">
                Manage your complaints and stay updated on their progress.
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleComplaintModalOpen}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Complaint
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-6 hover:shadow-xl transition-all duration-300 card-hover"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-semibold text-gray-800 font-['Inter']">
                  {stat.value}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-800 font-['Inter']">
                  {stat.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 font-['Inter']">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b border-emerald-100/30">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-emerald-900 font-['Inter']">
                Recent Complaints
              </h2>
              <button
                onClick={() => navigate("/complaints")}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm font-['Inter'] flex items-center group"
              >
                View all{" "}
                <ArrowUpRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-emerald-100/30 h-[calc(100vh-24rem)] overflow-y-auto">
            {!Array.isArray(userComplaints) || userComplaints.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No complaints yet. Click the button above to create one.</p>
              </div>
            ) : (
              userComplaints.map((complaint) => (
                <div
                  key={complaint.complaint_id}
                  className="p-5 hover:bg-emerald-50/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium text-emerald-900 font-['Inter']">
                          {complaint.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status.charAt(0).toUpperCase() +
                            complaint.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-sm text-emerald-600 font-['Inter'] leading-relaxed">
                        {complaint.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-500">
                        {complaint.location && (
                          <span className="flex items-center font-['Inter'] bg-emerald-50/50 px-2 py-1 rounded-md">
                            <MapPin className="w-3.5 h-3.5 mr-1.5" />
                            {complaint.location}
                          </span>
                        )}
                        <span className="flex items-center font-['Inter'] bg-emerald-50/50 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                        {complaint.priority && (
                          <span className="flex items-center font-['Inter'] bg-emerald-50/50 px-2 py-1 rounded-md">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                            {complaint.priority} priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-emerald-100/30">
              <h2 className="text-xl font-semibold text-emerald-900 font-['Inter']">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handleComplaintModalOpen}
                className="w-full p-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium font-['Inter'] text-lg">
                      New Complaint
                    </div>
                    <div className="text-sm text-white/90 font-['Inter']">
                      Report a new issue
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleLostFoundModalOpen}
                className="w-full p-4 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-xl hover:from-green-500 hover:to-teal-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium font-['Inter'] text-lg">
                      Lost & Found
                    </div>
                    <div className="text-sm text-white/90 font-['Inter']">
                      Report an item
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isComplaintModalOpen} onClose={handleComplaintModalClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">
            New Complaint
          </h2>
          <button
            onClick={handleComplaintModalClose}
            disabled={isSubmitting}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleComplaintSubmit} className="p-6 space-y-4">
          <FormInput
            label="Title"
            name="title"
            value={complaintFormData.title}
            onChange={handleComplaintInputChange}
            placeholder="e.g., Broken streetlight on main road"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Category"
              name="category"
              value={complaintFormData.category}
              onChange={handleComplaintInputChange}
            >
              <option value="infrastructure">Infrastructure</option>
              <option value="utilities">Utilities</option>
              <option value="safety">Safety</option>
              <option value="hostel">Hostel</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </FormSelect>
            <FormSelect
              label="Priority"
              name="priority"
              value={complaintFormData.priority}
              onChange={handleComplaintInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FormSelect>
          </div>

          <FormInput
            label="Location"
            name="location"
            value={complaintFormData.location}
            onChange={handleComplaintInputChange}
            placeholder="e.g., Outside 'A' Block, near library"
            required
          />
          <FormTextarea
            label="Description"
            name="description"
            value={complaintFormData.description}
            onChange={handleComplaintInputChange}
            placeholder="Provide as much detail as possible..."
            required
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleComplaintModalClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter'] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Submit Complaint"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isLostFoundModalOpen} onClose={handleLostFoundModalClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">
            Report an Item
          </h2>
          <button
            onClick={handleLostFoundModalClose}
            disabled={isSubmitting}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 pb-0">
          <div className="flex bg-gray-100/60 rounded-xl p-1.5 space-x-2">
            <button
              onClick={() => setReportType("lost")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${reportType === "lost"
                  ? "bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-md"
                  : "text-gray-600 hover:bg-white/60"
                }`}
            >
              <Package className="w-4 h-4" />
              <span>I Lost Something</span>
            </button>
            <button
              onClick={() => setReportType("found")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${reportType === "found"
                  ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-white/60"
                }`}
            >
              <PackageOpen className="w-4 h-4" />
              <span>I Found Something</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLostFoundSubmit} className="p-6 space-y-4">
          <FormInput
            label="Item Title"
            name="title"
            value={lostFoundFormData.title}
            onChange={handleLostFoundInputChange}
            placeholder="e.g., Black Leather Wallet"
            required
          />
          <FormTextarea
            label="Description"
            name="description"
            value={lostFoundFormData.description}
            onChange={handleLostFoundInputChange}
            placeholder="Brand, color, contents..."
            required
          />

          {reportType === "lost" && (
            <FormInput
              label="Distinguishing Features"
              name="distinguishingFeatures"
              value={lostFoundFormData.distinguishingFeatures}
              onChange={handleLostFoundInputChange}
              placeholder="e.g., 'A' monogram, scratch on corner"
            />
          )}

          <FormInput
            label={
              reportType === "lost" ? "Last Known Location" : "Location Found"
            }
            name="location"
            value={lostFoundFormData.location}
            onChange={handleLostFoundInputChange}
            placeholder="e.g., Library 2nd Floor"
            required
          />
          <FormInput
            label={reportType === "lost" ? "Date Lost" : "Date Found"}
            name="date"
            value={lostFoundFormData.date}
            onChange={handleLostFoundInputChange}
            type="date"
            required
          />

          <FormSelect
            label="Category"
            name="category"
            value={lostFoundFormData.category}
            onChange={handleLostFoundInputChange}
            required
          >
            <option>Personal Items</option>
            <option>Electronics</option>
            <option>Apparel</option>
            <option>Documents</option>
            <option>Other</option>
          </FormSelect>

          <FormInput
            label="Your Contact Details"
            name="contactDetails"
            value={lostFoundFormData.contactDetails}
            onChange={handleLostFoundInputChange}
            placeholder="Your email or phone number"
            required
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleLostFoundModalClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter'] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 text-white rounded-xl transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center ${reportType === "lost"
                  ? "bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500"
                  : "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600"
                }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : reportType === "lost" ? (
                "Report Lost Item"
              ) : (
                "Report Found Item"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
