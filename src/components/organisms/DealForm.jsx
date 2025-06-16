import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'
import { dealService, contactService, companyService, pipelineStageService } from '@/services'

const DealForm = ({ deal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    stage: 'Lead',
    closeDate: '',
    contactId: '',
    companyId: '',
    ownerId: 'user1',
    notes: ''
  })
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
if (deal) {
      setFormData({
        name: deal.Name,
        amount: deal.amount || 0,
        stage: deal.stage || 'Lead',
        closeDate: deal.close_date ? format(new Date(deal.close_date), 'yyyy-MM-dd') : '',
        contactId: deal.contact_id || '',
        companyId: deal.company_id || '',
        ownerId: deal.owner_id || 'user1',
        notes: deal.notes || ''
      })
    }
    loadData()
  }, [deal])

  const loadData = async () => {
    try {
      const [contactsData, companiesData, stagesData] = await Promise.all([
        contactService.getAll(),
        companyService.getAll(),
        pipelineStageService.getAll()
      ])
      setContacts(contactsData)
      setCompanies(companiesData)
      setStages(stagesData)
    } catch (error) {
      toast.error('Failed to load form data')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Deal name is required'
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (!formData.closeDate) newErrors.closeDate = 'Close date is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const dealData = {
        ...formData,
        closeDate: new Date(formData.closeDate).toISOString(),
        amount: parseFloat(formData.amount)
      }
      
let savedDeal
      if (deal) {
        savedDeal = await dealService.update(deal.Id, dealData)
        toast.success('Deal updated successfully')
      } else {
        savedDeal = await dealService.create(dealData)
        toast.success('Deal created successfully')
      }
      onSave(savedDeal)
    } catch (error) {
      toast.error(error.message || 'Failed to save deal')
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

  const companyOptions = companies.map(company => ({
    value: company.Id,
    label: company.Name
  }))

  const stageOptions = stages.map(stage => ({
    value: stage.Name,
    label: stage.Name
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {deal ? 'Edit Deal' : 'Add New Deal'}
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
          label="Deal Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
            required
          />
          
          <Input
            label="Close Date"
            type="date"
            value={formData.closeDate}
            onChange={(e) => handleChange('closeDate', e.target.value)}
            error={errors.closeDate}
            required
          />
        </div>

        <Select
          label="Stage"
          value={formData.stage}
          onChange={(e) => handleChange('stage', e.target.value)}
          options={stageOptions}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Contact"
            value={formData.contactId}
            onChange={(e) => handleChange('contactId', e.target.value)}
            options={contactOptions}
            placeholder="Select contact..."
          />
          
          <Select
            label="Company"
            value={formData.companyId}
            onChange={(e) => handleChange('companyId', e.target.value)}
            options={companyOptions}
            placeholder="Select company..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary focus:ring-1"
            placeholder="Additional notes about this deal..."
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
            {deal ? 'Update Deal' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default DealForm