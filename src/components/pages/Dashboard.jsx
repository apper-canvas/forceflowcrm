import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Chart from 'react-apexcharts'
import ApperIcon from '@/components/ApperIcon'
import LoadingSpinner from '@/components/molecules/LoadingSpinner'
import ErrorState from '@/components/molecules/ErrorState'
import { dealService, contactService, companyService, pipelineStageService } from '@/services'

const StatCard = ({ title, value, icon, change, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-secondary',
    warning: 'bg-accent',
    info: 'bg-blue-500'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={change >= 0 ? "TrendingUp" : "TrendingDown"} 
                size={16} 
                className={change >= 0 ? "text-green-500" : "text-red-500"} 
              />
              <span className={`text-sm ml-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <ApperIcon name={icon} size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}

const RecentActivity = ({ activities }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start space-x-3"
        >
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.bgColor}`}>
              <ApperIcon name={activity.icon} size={16} className={activity.iconColor} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{activity.text}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

const Dashboard = () => {
  const [data, setData] = useState({
    deals: [],
    contacts: [],
    companies: [],
    stages: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [deals, contacts, companies, stages] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        companyService.getAll(),
        pipelineStageService.getAll()
      ])
      
      setData({ deals, contacts, companies, stages })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />
  }
// Calculate metrics
  const totalDealsValue = data.deals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
  const openDeals = data.deals.filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage))
  const wonDeals = data.deals.filter(deal => deal.stage === 'Closed Won')
  const activeContacts = data.contacts.filter(contact => contact.status === 'Active')

  // Pipeline distribution data
  const pipelineData = data.stages.map(stage => {
    const stageDeals = data.deals.filter(deal => deal.stage === stage.Name)
    const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
    return {
      stage: stage.Name,
      count: stageDeals.length,
      value: stageValue,
      color: stage.color
    }
  })

  // Chart options
  const pipelineChartOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    labels: pipelineData.map(item => item.stage),
    colors: pipelineData.map(item => item.color),
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  const pipelineChartSeries = pipelineData.map(item => item.count)

// Recent activities (mock data based on deals)
  const recentActivities = [
    {
      text: `New deal "${data.deals[0]?.Name}" created`,
      time: '2 hours ago',
      icon: 'Plus',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      text: `Deal "${data.deals[1]?.Name}" moved to Negotiation`,
      time: '4 hours ago',
      icon: 'ArrowRight',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      text: `New contact "${data.contacts[0]?.first_name} ${data.contacts[0]?.last_name}" added`,
      time: '6 hours ago',
      icon: 'UserPlus',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      text: `Deal "${wonDeals[0]?.Name}" closed successfully`,
      time: '1 day ago',
      icon: 'CheckCircle',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ].filter(activity => activity.text.includes('undefined') === false)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your sales.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pipeline Value"
          value={`$${totalDealsValue.toLocaleString()}`}
          icon="DollarSign"
          change={12}
          color="success"
        />
        <StatCard
          title="Open Deals"
          value={openDeals.length}
          icon="TrendingUp"
          change={8}
          color="primary"
        />
        <StatCard
          title="Active Contacts"
          value={activeContacts.length}
          icon="Users"
          change={-3}
          color="info"
        />
        <StatCard
          title="Companies"
          value={data.companies.length}
          icon="Building2"
          change={15}
          color="warning"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h3>
          <Chart
            options={pipelineChartOptions}
            series={pipelineChartSeries}
            type="donut"
            height={350}
          />
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivities} />
      </div>

      {/* Pipeline Overview Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Deal Size
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pipelineData.map((stage, index) => (
                <motion.tr
                  key={stage.stage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stage.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${stage.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${stage.count > 0 ? Math.round(stage.value / stage.count).toLocaleString() : 0}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard