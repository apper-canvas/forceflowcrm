import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'
import { dealService, pipelineStageService, contactService, companyService } from '@/services'

const DealCard = ({ deal, contact, company, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
          {deal.name}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(deal)
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <ApperIcon name="Edit" size={14} />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-green-600">
            ${deal.amount?.toLocaleString()}
          </span>
          <Badge variant="info" size="sm">
            {format(new Date(deal.closeDate), 'MMM dd')}
          </Badge>
        </div>
        
        {contact && (
          <div className="flex items-center text-xs text-gray-600">
            <ApperIcon name="User" size={12} className="mr-1" />
            {contact.firstName} {contact.lastName}
          </div>
        )}
        
        {company && (
          <div className="flex items-center text-xs text-gray-600">
            <ApperIcon name="Building2" size={12} className="mr-1" />
            {company.name}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const KanbanColumn = ({ stage, deals, contacts, companies, onEditDeal }) => {
  const stageDeals = deals.filter(deal => deal.stage === stage.name)
  
  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-medium text-gray-900">{stage.name}</h3>
            <Badge variant="default" size="sm">
              {stageDeals.length}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            ${stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0).toLocaleString()}
          </div>
        </div>
        
        <SortableContext items={stageDeals} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[200px]">
            {stageDeals.map(deal => {
              const contact = contacts.find(c => c.id === deal.contactId)
              const company = companies.find(c => c.id === deal.companyId)
              
              return (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  contact={contact}
                  company={company}
                  onEdit={onEditDeal}
                />
              )
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

const KanbanBoard = ({ deals, onDealsChange, onEditDeal }) => {
  const [stages, setStages] = useState([])
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [activeDeal, setActiveDeal] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    loadSupportingData()
  }, [])

  const loadSupportingData = async () => {
    try {
      const [stagesData, contactsData, companiesData] = await Promise.all([
        pipelineStageService.getAll(),
        contactService.getAll(),
        companyService.getAll()
      ])
      setStages(stagesData)
      setContacts(contactsData)
      setCompanies(companiesData)
    } catch (error) {
      toast.error('Failed to load pipeline data')
    }
  }

  const handleDragStart = (event) => {
    const deal = deals.find(d => d.id === event.active.id)
    setActiveDeal(deal)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveDeal(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the stage the deal was dropped on
    let newStage = null
    for (const stage of stages) {
      const stageDeals = deals.filter(deal => deal.stage === stage.name)
      if (stageDeals.some(deal => deal.id === overId) || overId === stage.name) {
        newStage = stage.name
        break
      }
    }

    if (!newStage) return

    const deal = deals.find(d => d.id === activeId)
    if (deal && deal.stage !== newStage) {
      try {
        const updatedDeal = await dealService.updateStage(activeId, newStage)
        onDealsChange(deals.map(d => d.id === activeId ? updatedDeal : d))
        toast.success(`Deal moved to ${newStage}`)
      } catch (error) {
        toast.error('Failed to update deal stage')
      }
    }
  }

  if (stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ApperIcon name="Loader2" size={32} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {stages.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={deals}
            contacts={contacts}
            companies={companies}
            onEditDeal={onEditDeal}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeDeal && (
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 w-80 rotate-3">
            <h4 className="font-medium text-gray-900 mb-2">{activeDeal.name}</h4>
            <div className="text-lg font-semibold text-green-600">
              ${activeDeal.amount?.toLocaleString()}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard