import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import DataTableHeader from '@/components/molecules/DataTableHeader'
import SearchBar from '@/components/molecules/SearchBar'
import DataTable from '@/components/organisms/DataTable'
import ContactForm from '@/components/organisms/ContactForm'
import LoadingSpinner from '@/components/molecules/LoadingSpinner'
import ErrorState from '@/components/molecules/ErrorState'
import EmptyState from '@/components/molecules/EmptyState'
import StatusFilter from '@/components/molecules/StatusFilter'
import { contactService, companyService } from '@/services'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('firstName')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    loadContacts()
    loadCompanies()
  }, [])

  useEffect(() => {
    filterAndSortContacts()
  }, [contacts, searchQuery, statusFilter, sortField, sortDirection])

  const loadContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (err) {
      setError(err.message || 'Failed to load contacts')
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAll()
      setCompanies(data)
    } catch (error) {
      console.error('Failed to load companies:', error)
    }
  }

  const filterAndSortContacts = () => {
    let filtered = [...contacts]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(contact =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.jobTitle?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || ''
      let bValue = b[sortField] || ''
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredContacts(filtered)
  }

  const handleAdd = () => {
    setEditingContact(null)
    setShowForm(true)
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setShowForm(true)
  }

  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        await contactService.delete(contact.id)
        setContacts(contacts.filter(c => c.id !== contact.id))
        toast.success('Contact deleted successfully')
      } catch (error) {
        toast.error('Failed to delete contact')
      }
    }
  }

  const handleSave = (savedContact) => {
    if (editingContact) {
      setContacts(contacts.map(c => c.id === savedContact.id ? savedContact : c))
    } else {
      setContacts([...contacts, savedContact])
    }
    setShowForm(false)
    setEditingContact(null)
  }

  const handleSort = (field, direction) => {
    setSortField(field)
    setSortDirection(direction)
  }

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId)
    return company ? company.name : '-'
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Inactive', label: 'Inactive' }
  ]

  const tableColumns = [
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (value, contact) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary">
              {contact.firstName?.[0]}{contact.lastName?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </div>
            <div className="text-sm text-gray-500">{contact.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      sortable: true
    },
    {
      key: 'companyId',
      label: 'Company',
      sortable: false,
      render: (value) => getCompanyName(value)
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      type: 'badge',
      getBadgeVariant: (status) => {
        const variants = {
          'Active': 'success',
          'Lead': 'info',
          'Prospect': 'warning',
          'Inactive': 'default'
        }
        return variants[status] || 'default'
      }
    }
  ]

  if (loading) {
    return <LoadingSpinner message="Loading contacts..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadContacts} />
  }

  return (
    <div className="p-6">
      <DataTableHeader
        title="Contacts"
        count={filteredContacts.length}
        onAdd={handleAdd}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search contacts..."
            className="w-full sm:w-80"
          />
          <StatusFilter
            statuses={statusOptions}
            activeStatus={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>
      </DataTableHeader>

      {filteredContacts.length === 0 && !searchQuery && statusFilter === 'all' ? (
        <EmptyState
          icon="Users"
          title="No contacts yet"
          description="Start building your contact database by adding your first contact."
          actionLabel="Add Contact"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={filteredContacts}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      )}

      {/* Contact Form Modal */}
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
              <ContactForm
                contact={editingContact}
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

export default Contacts