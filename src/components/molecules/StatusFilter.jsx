import { motion } from 'framer-motion'

const StatusFilter = ({ 
  statuses, 
  activeStatus, 
  onStatusChange,
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statuses.map((status) => (
        <motion.button
          key={status.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStatusChange(status.value)}
          className={`
            px-3 py-1 rounded-full text-sm font-medium transition-all
            ${activeStatus === status.value
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {status.label}
        </motion.button>
      ))}
    </div>
  )
}

export default StatusFilter