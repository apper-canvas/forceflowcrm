import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const LoadingSpinner = ({ 
  size = 'md',
  message = 'Loading...',
  className = '' 
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32
  }
  
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-4"
      >
        <ApperIcon name="Loader2" size={sizes[size]} className="text-primary" />
      </motion.div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  )
}

export default LoadingSpinner