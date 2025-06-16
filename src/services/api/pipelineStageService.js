import stagesData from '@/services/mockData/pipelineStages.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let stages = [...stagesData]

const pipelineStageService = {
  async getAll() {
    await delay(200)
    return [...stages].sort((a, b) => a.order - b.order)
  },

  async getById(id) {
    await delay(150)
    const stage = stages.find(s => s.id === id)
    return stage ? { ...stage } : null
  },

  async create(stageData) {
    await delay(300)
    const newStage = {
      ...stageData,
      id: Date.now().toString(),
      order: stages.length
    }
    stages.push(newStage)
    return { ...newStage }
  },

  async update(id, stageData) {
    await delay(250)
    const index = stages.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Pipeline stage not found')
    
    stages[index] = {
      ...stages[index],
      ...stageData
    }
    return { ...stages[index] }
  },

  async delete(id) {
    await delay(200)
    const index = stages.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Pipeline stage not found')
    
    const deleted = stages.splice(index, 1)[0]
    return { ...deleted }
  }
}

export default pipelineStageService