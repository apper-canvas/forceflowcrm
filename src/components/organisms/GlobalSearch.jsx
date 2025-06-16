import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import { contactService, companyService, dealService } from '@/services'

const GlobalSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const searchAll = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const [contacts, companies, deals] = await Promise.all([
          contactService.search(query),
          companyService.search(query),
          dealService.getAll()
        ])

        const filteredDeals = deals.filter(deal =>
          deal.name.toLowerCase().includes(query.toLowerCase())
        )

        const searchResults = [
          ...contacts.slice(0, 3).map(item => ({ ...item, type: 'contact' })),
          ...companies.slice(0, 3).map(item => ({ ...item, type: 'company' })),
          ...filteredDeals.slice(0, 3).map(item => ({ ...item, type: 'deal' }))
        ]

        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchAll, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleResultClick = (result) => {
    switch (result.type) {
      case 'contact':
        navigate('/contacts')
        break
      case 'company':
        navigate('/companies')
        break
      case 'deal':
        navigate('/deals')
        break
    }
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ApperIcon name="Search" size={16} className="text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search contacts, companies, deals..."
          className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <AnimatePresence>
        {isOpen && (query || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <ApperIcon name="Loader2" size={16} className="animate-spin mx-auto text-gray-400" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <ApperIcon 
                          name={result.type === 'contact' ? 'User' : result.type === 'company' ? 'Building2' : 'TrendingUp'} 
                          size={16} 
                          className="text-gray-400" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.type === 'contact' ? `${result.firstName} ${result.lastName}` :
                           result.type === 'company' ? result.name :
                           result.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.type === 'contact' ? result.email :
                           result.type === 'company' ? result.industry :
                           `$${result.amount?.toLocaleString()} • ${result.stage}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query && (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GlobalSearch