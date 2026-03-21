// @ts-nocheck
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiShoppingBag,
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiBatteryCharging,
  FiTrendingUp,
  FiEye,
  FiEdit,
  FiCalendar,
  FiPower,
  FiBattery,
  FiAlertCircle,
  FiClock,
  FiSettings,
  FiZap,
  FiTool,
  FiPackage,
  FiTruck,
  FiArchive
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ServiceOrder {
  id: number;
  service_code: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  battery_model: string;
  battery_serial: string;
  inverter_model: string;
  inverter_serial: string;
  status: string;
  priority: string;
  payment_status: string;
  estimated_cost: string;
  final_cost: string;
  created_at: string;
}

interface DashboardStats {
  total_services: number;
  pending_services: number;
  total_customers: number;
  total_batteries: number;
  completed_services: number;
  spare_batteries: number;
  status_pending?: number;
  status_scheduled?: number;
  status_in_progress?: number;
  status_charging?: number;
  status_testing?: number;
  status_repair?: number;
  status_completed?: number;
  status_ready?: number;
  status_delivered?: number;
  status_cancelled?: number;
  priority_urgent?: number;
  priority_high?: number;
  priority_medium?: number;
  priority_low?: number;
}

interface Activity {
  activity: string;
  timestamp: string;
}

interface DashboardTabProps {
  dashboardStats: DashboardStats;
  services: ServiceOrder[];
  activities: Activity[];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getPaymentStatusColor: (status: string) => string;
  getServiceTypeColor: (type: string) => string;
  onViewService: (service: ServiceOrder) => void;
  onEditService: (service: ServiceOrder) => void;
  onViewAllServices: () => void;
  loading: boolean;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  dashboardStats,
  services,
  activities,
  getStatusColor,
  getPriorityColor,
  getPaymentStatusColor,
  getServiceTypeColor,
  onViewService,
  onEditService,
  onViewAllServices,
  loading
}) => {
  // State for current date and time
  const [currentDateTime, setCurrentDateTime] = useState<{
    date: string;
    time: string;
    day: string;
    month: string;
    year: string;
    hour: string;
    minute: string;
    second: string;
    ampm: string;
  }>({
    date: "",
    time: "",
    day: "",
    month: "",
    year: "",
    hour: "",
    minute: "",
    second: "",
    ampm: ""
  });

  // Update current date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format date components separately for better styling
      const day = now.toLocaleDateString('en-IN', { weekday: 'long' });
      const date = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      // Get time components
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Format time with AM/PM
      const time = now.toLocaleTimeString('en-IN', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Get AM/PM
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      // Format hours in 12-hour format
      const hour12 = hours % 12 || 12;
      
      setCurrentDateTime({
        date,
        time,
        day,
        month: now.toLocaleDateString('en-IN', { month: 'long' }),
        year: now.getFullYear().toString(),
        hour: hour12.toString().padStart(2, '0'),
        minute: minutes.toString().padStart(2, '0'),
        second: seconds.toString().padStart(2, '0'),
        ampm
      });
    };
    
    // Update immediately
    updateDateTime();
    
    // Update every second
    const intervalId = setInterval(updateDateTime, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Stats data - Updated to remove urgent_priority
  const statsData = [
    {
      id: 1,
      title: "Total Services",
      value: dashboardStats.total_services.toString(),
      change: "",
      icon: <FiShoppingBag />,
      color: "#10B981",
      bgColor: "#ECFDF5"
    },
    {
      id: 2,
      title: "Pending Services",
      value: dashboardStats.pending_services.toString(),
      change: "",
      icon: <FiActivity />,
      color: "#F59E0B",
      bgColor: "#FFFBEB"
    },
    {
      id: 3,
      title: "Total Clients",
      value: dashboardStats.total_customers.toString(),
      change: "",
      icon: <FiUsers />,
      color: "#3B82F6",
      bgColor: "#EFF6FF"
    },
    {
      id: 4,
      title: "Completed Services",
      value: dashboardStats.completed_services.toString(),
      change: "",
      icon: <FiCheckCircle />,
      color: "#8B5CF6",
      bgColor: "#F5F3FF"
    },
    {
      id: 5,
      title: "Total Batteries",
      value: dashboardStats.total_batteries.toString(),
      change: "",
      icon: <FiBattery />,
      color: "#10B981",
      bgColor: "#ECFDF5"
    },
    {
      id: 6,
      title: "Spare Batteries",
      value: dashboardStats.spare_batteries?.toString() || "0",
      change: "",
      icon: <FiPackage />,
      color: "#F59E0B",
      bgColor: "#FFFBEB"
    }
  ];

  // Status statistics data
  const statusStatsData = [
    {
      id: 1,
      title: "Pending",
      value: dashboardStats.status_pending?.toString() || "0",
      icon: <FiClock />,
      color: "#6B7280",
      bgColor: "#F3F4F6"
    },
    {
      id: 2,
      title: "Scheduled",
      value: dashboardStats.status_scheduled?.toString() || "0",
      icon: <FiCalendar />,
      color: "#6366F1",
      bgColor: "#EEF2FF"
    },
    {
      id: 3,
      title: "In Progress",
      value: dashboardStats.status_in_progress?.toString() || "0",
      icon: <FiSettings />,
      color: "#F59E0B",
      bgColor: "#FFFBEB"
    },
    {
      id: 4,
      title: "Charging",
      value: dashboardStats.status_charging?.toString() || "0",
      icon: <FiZap />,
      color: "#EC4899",
      bgColor: "#FDF2F8"
    },
    {
      id: 5,
      title: "Testing",
      value: dashboardStats.status_testing?.toString() || "0",
      icon: <FiTool />,
      color: "#8B5CF6",
      bgColor: "#F5F3FF"
    },
    {
      id: 6,
      title: "Repair",
      value: dashboardStats.status_repair?.toString() || "0",
      icon: <FiTool />,
      color: "#F97316",
      bgColor: "#FFF7ED"
    },
    {
      id: 7,
      title: "Completed",
      value: dashboardStats.status_completed?.toString() || "0",
      icon: <FiCheckCircle />,
      color: "#10B981",
      bgColor: "#ECFDF5"
    },
    {
      id: 8,
      title: "Ready",
      value: dashboardStats.status_ready?.toString() || "0",
      icon: <FiCheckCircle />,
      color: "#22C55E",
      bgColor: "#F0FDF4"
    },
    {
      id: 9,
      title: "Delivered",
      value: dashboardStats.status_delivered?.toString() || "0",
      icon: <FiTruck />,
      color: "#3B82F6",
      bgColor: "#EFF6FF"
    },
    {
      id: 10,
      title: "Cancelled",
      value: dashboardStats.status_cancelled?.toString() || "0",
      icon: <FiAlertCircle />,
      color: "#DC2626",
      bgColor: "#FEF2F2"
    }
  ];

  // Priority statistics data
  const priorityStatsData = [
    {
      id: 1,
      title: "Urgent",
      value: dashboardStats.priority_urgent?.toString() || "0",
      icon: <FiAlertCircle />,
      color: "#DC2626",
      bgColor: "#FEF2F2"
    },
    {
      id: 2,
      title: "High",
      value: dashboardStats.priority_high?.toString() || "0",
      icon: <FiAlertCircle />,
      color: "#F59E0B",
      bgColor: "#FFFBEB"
    },
    {
      id: 3,
      title: "Medium",
      value: dashboardStats.priority_medium?.toString() || "0",
      icon: <FiAlertCircle />,
      color: "#3B82F6",
      bgColor: "#EFF6FF"
    },
    {
      id: 4,
      title: "Low",
      value: dashboardStats.priority_low?.toString() || "0",
      icon: <FiAlertCircle />,
      color: "#10B981",
      bgColor: "#ECFDF5"
    }
  ];

  // Chart data - filter out zero values
  const statusData = [
    { name: 'Pending', value: dashboardStats.status_pending || 0, color: '#6B7280' },
    { name: 'Scheduled', value: dashboardStats.status_scheduled || 0, color: '#6366F1' },
    { name: 'In Progress', value: dashboardStats.status_in_progress || 0, color: '#F59E0B' },
    { name: 'Charging', value: dashboardStats.status_charging || 0, color: '#EC4899' },
    { name: 'Testing', value: dashboardStats.status_testing || 0, color: '#8B5CF6' },
    { name: 'Repair', value: dashboardStats.status_repair || 0, color: '#F97316' },
    { name: 'Completed', value: dashboardStats.status_completed || 0, color: '#10B981' },
    { name: 'Ready', value: dashboardStats.status_ready || 0, color: '#22C55E' },
    { name: 'Delivered', value: dashboardStats.status_delivered || 0, color: '#3B82F6' },
    { name: 'Cancelled', value: dashboardStats.status_cancelled || 0, color: '#DC2626' }
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Urgent', value: dashboardStats.priority_urgent || 0, color: '#DC2626' },
    { name: 'High', value: dashboardStats.priority_high || 0, color: '#F59E0B' },
    { name: 'Medium', value: dashboardStats.priority_medium || 0, color: '#3B82F6' },
    { name: 'Low', value: dashboardStats.priority_low || 0, color: '#10B981' }
  ].filter(item => item.value > 0);

  // Custom label render function for pie charts
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      {/* Big Date & Time Display Card */}
      <motion.div 
        className="big-datetime-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="datetime-content">
          <div className="date-section">
            <div className="day-name">{currentDateTime.day}</div>
            <div className="full-date">
              <span className="date-number">
                {new Date().getDate().toString().padStart(2, '0')}
              </span>
              <span className="date-month-year">
                <span className="month">{currentDateTime.month}</span>
                <span className="year">{currentDateTime.year}</span>
              </span>
            </div>
          </div>
          
          <div className="time-section">
            <div className="time-display">
              <div className="time-digits">
                <motion.span 
                  key={currentDateTime.hour}
                  className="time-hour"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentDateTime.hour}
                </motion.span>
                <span className="time-colon">:</span>
                <motion.span 
                  key={currentDateTime.minute}
                  className="time-minute"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {currentDateTime.minute}
                </motion.span>
                <span className="time-colon">:</span>
                <motion.span 
                  key={currentDateTime.second}
                  className="time-second"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {currentDateTime.second}
                </motion.span>
              </div>
              <div className="time-ampm">{currentDateTime.ampm}</div>
            </div>
          </div>
          
          <div className="datetime-icons">
            <div className="icon-item">
              <FiCalendar className="icon" />
              <span>Date</span>
            </div>
            <div className="icon-item">
              <FiClock className="icon" />
              <span>Time</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div 
              className="stat-icon-container"
              style={{ backgroundColor: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
              {stat.change && (
                <div className="stat-change">
                  <FiTrendingUp />
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status Statistics Grid */}
      <div className="section-header">
        <div className="section-title">
          <h2>Service Status Statistics</h2>
          <p>Detailed breakdown of service order statuses</p>
        </div>
      </div>
      <div className="stats-grid">
        {statusStatsData.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="stat-card small"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <div 
              className="stat-icon-container"
              style={{ backgroundColor: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Priority Statistics Grid */}
      <div className="section-header">
        <div className="section-title">
          <h2>Priority Statistics</h2>
          <p>Breakdown of service order priorities</p>
        </div>
      </div>
      <div className="stats-grid">
        {priorityStatsData.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="stat-card small"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <div 
              className="stat-icon-container"
              style={{ backgroundColor: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section - Only 2 charts now */}
      <div className="charts-section">
        {/* Service Status Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Service Status Distribution</h3>
            <p>Current service order status overview</p>
          </div>
          <div className="chart-container">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomLabel}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} services`, 'Count']}
                    labelFormatter={(label: string) => `Status: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <FiShoppingBag className="empty-icon" />
                <p>No service status data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Priority Distribution</h3>
            <p>Service order priority breakdown</p>
          </div>
          <div className="chart-container">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomLabel}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} services`, 'Count']}
                    labelFormatter={(label: string) => `Priority: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">
                <FiArchive className="empty-icon" />
                <p>No priority data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      {activities.length > 0 && (
        <div className="activities-section">
          <div className="section-header">
            <div className="section-title">
              <h2>Recent Activities</h2>
              <p>Latest system activities</p>
            </div>
          </div>
          <div className="activities-list">
            {activities.slice(0, 5).map((activity, index) => (
              <motion.div 
                key={index}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="activity-icon">
                  <FiCheckCircle />
                </div>
                <div className="activity-content">
                  <p>{activity.activity}</p>
                  <span className="activity-time">{activity.timestamp}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Services */}
      <div className="orders-section">
        <div className="section-header">
          <div className="section-title">
            <h2>Recent Service Orders</h2>
            <p>Latest service orders requiring attention</p>
          </div>
          <button 
            className="btn outline"
            onClick={onViewAllServices}
          >
            View All Services
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading recent services...</p>
            </div>
          ) : services.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Service Code</th>
                  <th>Service Type</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Payment</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.slice(0, 5).map((service, index) => (
                  <motion.tr 
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    onClick={() => onViewService(service)}
                  >
                    <td>
                      <div className="order-id-cell">
                        <span className="order-id">{service.service_code}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="service-type-badge"
                        style={{ 
                          backgroundColor: getServiceTypeColor(service.service_type || 'battery_service') + '20',
                          color: getServiceTypeColor(service.service_type || 'battery_service')
                        }}
                      >
                        {service.service_type?.replace('_', ' ') || 'Battery Service'}
                      </span>
                    </td>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar-placeholder">
                          {service.customer_name?.charAt(0) || 'C'}
                        </div>
                        <div className="client-info">
                          <span className="client-name">{service.customer_name}</span>
                          <span className="client-phone">{service.customer_phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <div 
                          className="status-indicator"
                          style={{ backgroundColor: getStatusColor(service.status) }}
                        ></div>
                        <span className="status-label">{service.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td>
                      <span className="priority-badge" style={{ 
                        backgroundColor: getPriorityColor(service.priority) + '20',
                        color: getPriorityColor(service.priority)
                      }}>
                        {service.priority}
                      </span>
                    </td>
                    <td>
                      <span className="payment-badge" style={{ 
                        backgroundColor: getPaymentStatusColor(service.payment_status) + '20',
                        color: getPaymentStatusColor(service.payment_status)
                      }}>
                        {service.payment_status}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <FiCalendar />
                        <span>{new Date(service.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <motion.button 
                          className="action-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewService(service);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View Details"
                        >
                          <FiEye />
                        </motion.button>
                        <motion.button 
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditService(service);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit Service Order"
                        >
                          <FiEdit />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FiShoppingBag className="empty-icon" />
              <h3>No service orders found</h3>
              <p>Start by creating your first service order</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
