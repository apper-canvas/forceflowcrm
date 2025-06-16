import { toast } from 'react-toastify'

const contactService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'first_name', 'last_name', 'email', 'phone', 'job_title', 'company_id', 'status', 'notes']
      }
      
      const response = await apperClient.fetchRecords('contact', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching contacts:", error)
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
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'first_name', 'last_name', 'email', 'phone', 'job_title', 'company_id', 'status', 'notes']
      }
      
      const response = await apperClient.getRecordById('contact', id, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error)
      throw error
    }
  },

  async create(contactData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      // Only include Updateable fields
      const updateableData = {
        Name: `${contactData.firstName || contactData.first_name} ${contactData.lastName || contactData.last_name}`,
        Tags: contactData.tags || contactData.Tags,
        Owner: contactData.owner || contactData.Owner,
        first_name: contactData.firstName || contactData.first_name,
        last_name: contactData.lastName || contactData.last_name,
        email: contactData.email,
        phone: contactData.phone,
        job_title: contactData.jobTitle || contactData.job_title,
        company_id: parseInt(contactData.companyId || contactData.company_id) || null,
        status: contactData.status,
        notes: contactData.notes
      }
      
      const params = {
        records: [updateableData]
      }
      
      const response = await apperClient.createRecord('contact', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} contacts:${JSON.stringify(failedRecords)}`)
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
      console.error("Error creating contact:", error)
      throw error
    }
  },

  async update(id, contactData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      // Only include Updateable fields
      const updateableData = {
        Id: parseInt(id),
        Name: `${contactData.firstName || contactData.first_name} ${contactData.lastName || contactData.last_name}`,
        Tags: contactData.tags || contactData.Tags,
        Owner: contactData.owner || contactData.Owner,
        first_name: contactData.firstName || contactData.first_name,
        last_name: contactData.lastName || contactData.last_name,
        email: contactData.email,
        phone: contactData.phone,
        job_title: contactData.jobTitle || contactData.job_title,
        company_id: parseInt(contactData.companyId || contactData.company_id) || null,
        status: contactData.status,
        notes: contactData.notes
      }
      
      const params = {
        records: [updateableData]
      }
      
      const response = await apperClient.updateRecord('contact', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} contacts:${JSON.stringify(failedUpdates)}`)
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
      console.error("Error updating contact:", error)
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
      
      const response = await apperClient.deleteRecord('contact', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} contacts:${JSON.stringify(failedDeletions)}`)
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return response.results.some(result => result.success)
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
      throw error
    }
  },

  async search(query) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'first_name', 'last_name', 'email', 'phone', 'job_title', 'company_id', 'status', 'notes'],
        whereGroups: [
          {
            operator: "OR",
            SubGroups: [
              {
                conditions: [
                  {
                    FieldName: "first_name",
                    Operator: "Contains",
                    Values: [query]
                  }
                ],
                operator: ""
              },
              {
                conditions: [
                  {
                    FieldName: "last_name",
                    Operator: "Contains",
                    Values: [query]
                  }
                ],
                operator: ""
              },
              {
                conditions: [
                  {
                    FieldName: "email",
                    Operator: "Contains",
                    Values: [query]
                  }
                ],
                operator: ""
              }
            ]
          }
        ]
      }
      
      const response = await apperClient.fetchRecords('contact', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error searching contacts:", error)
      throw error
    }
  }
}

export default contactService