import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'
import { companyService, contactService } from '@/services'

const CompanyForm = ({ company, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
    revenue: 0,
    primaryContactId: '',
    notes: ''
  })
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

useEffect(() => {
    if (company) {
      setFormData({
        name: company.Name || '',
        industry: company.industry || '',
        website: company.website || '',
        phone: company.phone || '',
        address: company.address || '',
        revenue: company.revenue || 0,
        primaryContactId: company.primary_contact_id || '',
        notes: company.notes || ''
      })
    }
    loadContacts()
  }, [company])

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      toast.error('Failed to load contacts')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Company name is required'
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
let savedCompany
      if (company) {
        savedCompany = await companyService.update(company.Id, formData)
        toast.success('Company updated successfully')
      } else {
        savedCompany = await companyService.create(formData)
        toast.success('Company created successfully')
      }
      onSave(savedCompany)
    } catch (error) {
      toast.error(error.message || 'Failed to save company')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

const contactOptions = contacts.map(contact => ({
    value: contact.Id,
    label: `${contact.first_name} ${contact.last_name}`
  }))

  const industryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Education', label: 'Education' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Software Development', label: 'Software Development' },
    { value: 'Other', label: 'Other' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {company ? 'Edit Company' : 'Add New Company'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Company Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Industry"
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            options={industryOptions}
            error={errors.industry}
            required
          />
          
          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          
          <Input
            label="Annual Revenue"
            type="number"
            value={formData.revenue}
            onChange={(e) => handleChange('revenue', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Full business address"
        />

        <Select
          label="Primary Contact"
          value={formData.primaryContactId}
          onChange={(e) => handleChange('primaryContactId', e.target.value)}
          options={contactOptions}
          placeholder="Select primary contact..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary focus:ring-1"
            placeholder="Additional notes about this company..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {company ? 'Update Company' : 'Create Company'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default CompanyForm