import { toast } from 'react-toastify'

const dealService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'amount', 'stage', 'close_date', 'contact_id', 'company_id', 'owner_id', 'notes']
      }
      
      const response = await apperClient.fetchRecords('deal', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching deals:", error)
      throw error
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'amount', 'stage', 'close_date', 'contact_id', 'company_id', 'owner_id', 'notes']
      }
      
      const response = await apperClient.getRecordById('deal', id, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching deal with ID ${id}:`, error)
      throw error
    }
  },

  async create(dealData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      // Only include Updateable fields and format properly
      const updateableData = {
        Name: dealData.name || dealData.Name,
        Tags: dealData.tags || dealData.Tags,
        Owner: dealData.owner || dealData.Owner,
        amount: parseFloat(dealData.amount) || 0,
        stage: dealData.stage,
        close_date: dealData.closeDate ? new Date(dealData.closeDate).toISOString().split('T')[0] : null,
        contact_id: parseInt(dealData.contactId || dealData.contact_id) || null,
        company_id: parseInt(dealData.companyId || dealData.company_id) || null,
        owner_id: parseInt(dealData.ownerId || dealData.owner_id) || null,
        notes: dealData.notes
      }
      
      const params = {
        records: [updateableData]
      }
      
      const response = await apperClient.createRecord('deal', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} deals:${JSON.stringify(failedRecords)}`)
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null
      }
    } catch (error) {
      console.error("Error creating deal:", error)
      throw error
    }
  },

  async update(id, dealData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      // Only include Updateable fields
      const updateableData = {
        Id: parseInt(id),
        Name: dealData.name || dealData.Name,
        Tags: dealData.tags || dealData.Tags,
        Owner: dealData.owner || dealData.Owner,
        amount: parseFloat(dealData.amount) || 0,
        stage: dealData.stage,
        close_date: dealData.closeDate ? new Date(dealData.closeDate).toISOString().split('T')[0] : null,
        contact_id: parseInt(dealData.contactId || dealData.contact_id) || null,
        company_id: parseInt(dealData.companyId || dealData.company_id) || null,
        owner_id: parseInt(dealData.ownerId || dealData.owner_id) || null,
        notes: dealData.notes
      }
      
      const params = {
        records: [updateableData]
      }
      
      const response = await apperClient.updateRecord('deal', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} deals:${JSON.stringify(failedUpdates)}`)
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null
      }
    } catch (error) {
      console.error("Error updating deal:", error)
      throw error
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord('deal', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} deals:${JSON.stringify(failedDeletions)}`)
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return response.results.some(result => result.success)
      }
    } catch (error) {
      console.error("Error deleting deal:", error)
      throw error
    }
  },

  async updateStage(id, newStage) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const updateableData = {
        Id: parseInt(id),
        stage: newStage
      }
      
      const params = {
        records: [updateableData]
      }
      
      const response = await apperClient.updateRecord('deal', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} deal stages:${JSON.stringify(failedUpdates)}`)
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null
      }
    } catch (error) {
      console.error("Error updating deal stage:", error)
      throw error
    }
  },

  async getByStage(stage) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'amount', 'stage', 'close_date', 'contact_id', 'company_id', 'owner_id', 'notes'],
        where: [
          {
            FieldName: "stage",
            Operator: "ExactMatch",
            Values: [stage]
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('deal', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching deals by stage:", error)
      throw error
    }
  }
}

export default dealService