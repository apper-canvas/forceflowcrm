import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const DataTableHeader = ({ 
  title,
  count,
  onAdd,
  children 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {count !== undefined && (
          <p className="text-sm text-gray-600">{count} records</p>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {children}
        
        {onAdd && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add {title.slice(0, -1)}
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default DataTableHeader