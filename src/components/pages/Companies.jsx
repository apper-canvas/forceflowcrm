import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import DataTableHeader from '@/components/molecules/DataTableHeader'
import SearchBar from '@/components/molecules/SearchBar'
import DataTable from '@/components/organisms/DataTable'
import CompanyForm from '@/components/organisms/CompanyForm'
import LoadingSpinner from '@/components/molecules/LoadingSpinner'
import ErrorState from '@/components/molecules/ErrorState'
import EmptyState from '@/components/molecules/EmptyState'
import { companyService, contactService } from '@/services'

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [contacts, setContacts] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    loadCompanies()
    loadContacts()
  }, [])

  useEffect(() => {
    filterAndSortCompanies()
  }, [companies, searchQuery, sortField, sortDirection])

  const loadCompanies = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await companyService.getAll()
      setCompanies(data)
    } catch (err) {
      setError(err.message || 'Failed to load companies')
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }

  const filterAndSortCompanies = () => {
    let filtered = [...companies]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || ''
      let bValue = b[sortField] || ''
      
      if (sortField === 'revenue') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
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

    setFilteredCompanies(filtered)
  }

  const handleAdd = () => {
    setEditingCompany(null)
    setShowForm(true)
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    setShowForm(true)
  }

  const handleDelete = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await companyService.delete(company.id)
        setCompanies(companies.filter(c => c.id !== company.id))
        toast.success('Company deleted successfully')
      } catch (error) {
        toast.error('Failed to delete company')
      }
    }
  }

  const handleSave = (savedCompany) => {
    if (editingCompany) {
      setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c))
    } else {
      setCompanies([...companies, savedCompany])
    }
    setShowForm(false)
    setEditingCompany(null)
  }

  const handleSort = (field, direction) => {
    setSortField(field)
    setSortDirection(direction)
  }

  const getPrimaryContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId)
    return contact ? `${contact.firstName} ${contact.lastName}` : '-'
  }

  const tableColumns = [
    {
      key: 'name',
      label: 'Company',
      sortable: true,
      render: (value, company) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary">
              {company.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{company.name}</div>
            <div className="text-sm text-gray-500">{company.industry}</div>
          </div>
        </div>
      )
    },
    {
      key: 'website',
      label: 'Website',
      sortable: false,
      render: (value) => value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80"
        >
          {value.replace(/^https?:\/\//, '')}
        </a>
      ) : '-'
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      type: 'currency'
    },
    {
      key: 'primaryContactId',
      label: 'Primary Contact',
      sortable: false,
      render: (value) => getPrimaryContactName(value)
    }
  ]

  if (loading) {
    return <LoadingSpinner message="Loading companies..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadCompanies} />
  }

  return (
    <div className="p-6">
      <DataTableHeader
        title="Companies"
        count={filteredCompanies.length}
        onAdd={handleAdd}
      >
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search companies..."
          className="w-full sm:w-80"
        />
      </DataTableHeader>

      {filteredCompanies.length === 0 && !searchQuery ? (
        <EmptyState
          icon="Building2"
          title="No companies yet"
          description="Start building your company database by adding your first company."
          actionLabel="Add Company"
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          data={filteredCompanies}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      )}

      {/* Company Form Modal */}
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
              <CompanyForm
                company={editingCompany}
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

export default Companies