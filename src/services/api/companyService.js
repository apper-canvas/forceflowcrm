import companiesData from '@/services/mockData/companies.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let companies = [...companiesData]

const companyService = {
  async getAll() {
    await delay(300)
    return [...companies]
  },

  async getById(id) {
    await delay(200)
    const company = companies.find(c => c.id === id)
    return company ? { ...company } : null
  },

  async create(companyData) {
    await delay(400)
    const newCompany = {
      ...companyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    companies.push(newCompany)
    return { ...newCompany }
  },

  async update(id, companyData) {
    await delay(350)
    const index = companies.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Company not found')
    
    companies[index] = {
      ...companies[index],
      ...companyData,
      updatedAt: new Date().toISOString()
    }
    return { ...companies[index] }
  },

  async delete(id) {
    await delay(250)
    const index = companies.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Company not found')
    
    const deleted = companies.splice(index, 1)[0]
    return { ...deleted }
  },

  async search(query) {
    await delay(200)
    const lowerQuery = query.toLowerCase()
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(lowerQuery) ||
      company.industry.toLowerCase().includes(lowerQuery)
    )
    return [...filtered]
  }
}

export default companyService