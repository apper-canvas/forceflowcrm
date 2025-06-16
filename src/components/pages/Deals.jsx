import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import DataTableHeader from '@/components/molecules/DataTableHeader'
import SearchBar from '@/components/molecules/SearchBar'
import DataTable from '@/components/organisms/DataTable'
import KanbanBoard from '@/components/organisms/KanbanBoard'
import DealForm from '@/components/organisms/DealForm'
import LoadingSpinner from '@/components/molecules/LoadingSpinner'
import ErrorState from '@/components/molecules/ErrorState'
import EmptyState from '@/components/molecules/EmptyState'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { dealService, contactService, companyService } from '@/services'

const Deals = () => {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [filteredDeals, setFilteredDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'table'
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortDeals()
  }, [deals, searchQuery, sortField, sortDirection])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dealsData, contactsData, companiesData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        companyService.getAll()
      ])
      setDeals(dealsData)
      setContacts(contactsData)
      setCompanies(companiesData)
    } catch (err) {
      setError(err.message || 'Failed to load deals')
      toast.error('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDeals = () => {
    let filtered = [...deals]

    // Apply search filter
    if (searchQuery) {
const query = searchQuery.toLowerCase()
      filtered = filtered.filter(deal =>
        deal.Name?.toLowerCase().includes(query) ||
        deal.stage?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || ''
      let bValue = b[sortField] || ''
      
      if (sortField === 'amount') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      } else if (sortField === 'closeDate') {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredDeals(filtered)
  }

  const handleAdd = () => {
    setEditingDeal(null)
    setShowForm(true)
  }

  const handleEdit = (deal) => {
    setEditingDeal(deal)
    setShowForm(true)
  }

const handleDelete = async (deal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.Name}"?`)) {
      try {
        await dealService.delete(deal.Id)
        setDeals(deals.filter(d => d.Id !== deal.Id))
        toast.success('Deal deleted successfully')
      } catch (error) {
        toast.error('Failed to delete deal')
      }
    }
  }
const handleSave = (savedDeal) => {
    if (editingDeal) {
      setDeals(deals.map(d => d.Id === savedDeal.Id ? savedDeal : d))
    } else {
      setDeals([...deals, savedDeal])
    }
    setShowForm(false)
    setEditingDeal(null)
  }

  const handleSort = (field, direction) => {
    setSortField(field)
    setSortDirection(direction)
  }
const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? `${contact.first_name} ${contact.last_name}` : '-'
  }

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.Id === companyId)
    return company ? company.Name : '-'
  }
const tableColumns = [
    {
      key: 'Name',
      label: 'Deal Name',
      sortable: true,
      render: (value, deal) => (
        <div>
          <div className="font-medium text-gray-900">{deal.Name}</div>
          <div className="text-sm text-gray-500">{deal.stage}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      type: 'currency'
    },
    {
      key: 'stage',
      label: 'Stage',
      sortable: true,
      type: 'badge',
      getBadgeVariant: (stage) => {
        const variants = {
          'Lead': 'default',
          'Qualified': 'info',
          'Proposal': 'warning',
          'Negotiation': 'primary',
          'Closed Won': 'success',
          'Closed Lost': 'danger'
        }
        return variants[stage] || 'default'
      }
},
    {
      key: 'close_date',
      label: 'Close Date',
      sortable: true,
      type: 'date'
    },
    {
      key: 'contact_id',
      label: 'Contact',
      sortable: false,
      render: (value) => getContactName(value)
    },
    {
      key: 'company_id',
      label: 'Company',
      sortable: false,
      render: (value) => getCompanyName(value)
    }
  ]

  if (loading) {
    return <LoadingSpinner message="Loading deals..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />
  }

  return (
    <div className="p-6">
      <DataTableHeader
        title="Deals"
        count={filteredDeals.length}
        onAdd={handleAdd}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search deals..."
            className="w-full sm:w-80"
          />
          
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
              size="sm"
              icon="LayoutGrid"
              onClick={() => setViewMode('kanban')}
              className="rounded-none border-0"
            >
              Kanban
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              icon="List"
              onClick={() => setViewMode('table')}
              className="rounded-none border-0 border-l border-gray-300"
            >
              Table
            </Button>
          </div>
        </div>
      </DataTableHeader>

      {filteredDeals.length === 0 && !searchQuery ? (
        <EmptyState
          icon="TrendingUp"
          title="No deals yet"
          description="Start tracking your sales opportunities by creating your first deal."
          actionLabel="Add Deal"
          onAction={handleAdd}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {viewMode === 'kanban' ? (
            <div className="p-6">
              <KanbanBoard
                deals={filteredDeals}
                onDealsChange={setDeals}
                onEditDeal={handleEdit}
              />
            </div>
          ) : (
            <DataTable
              data={filteredDeals}
              columns={tableColumns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          )}
        </div>
      )}

      {/* Deal Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DealForm
                deal={editingDeal}
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Deals