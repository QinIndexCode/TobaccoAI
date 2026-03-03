import { useState, useEffect } from 'react'
import api from './api'

/**
 * 智能搜索 Hook
 * @param {string} query - 搜索关键词
 * @param {string} type - 搜索类型：'all' | 'growth' | 'diseases' | 'nutrients'
 * @returns {Object} { data, loading, error, totalResults, expandedKeywords }
 */
export function useSmartSearch(query = '', type = 'all') {
  const [data, setData] = useState({
    growth_stages: [],
    diseases: [],
    nutrients: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalResults, setTotalResults] = useState(0)
  const [expandedKeywords, setExpandedKeywords] = useState([])

  useEffect(() => {
    // 如果没有搜索词，清空数据
    if (!query || !query.trim()) {
      // 加载全部数据
      loadAllData()
      return
    }

    const search = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await api.get('/api/knowledge/search', {
          params: { q: query.trim() }
        })
        
        if (response.data && response.data.data) {
          setData(response.data.data)
          setTotalResults(response.data.total_results || 0)
          setExpandedKeywords(response.data.expanded_keywords || [])
        }
      } catch (err) {
        console.error('搜索失败:', err)
        setError(err.message || '搜索失败')
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query, type])

  // 加载全部数据（无搜索时）
  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [stagesRes, diseasesRes, nutrientsRes] = await Promise.all([
        api.get('/api/knowledge/growth-stages'),
        api.get('/api/knowledge/diseases'),
        api.get('/api/knowledge/nutrients')
      ])
      
      const allData = {
        growth_stages: stagesRes.data || [],
        diseases: diseasesRes.data || [],
        nutrients: nutrientsRes.data || []
      }
      
      setData(allData)
      setTotalResults(
        allData.growth_stages.length + 
        allData.diseases.length + 
        allData.nutrients.length
      )
      setExpandedKeywords([])
    } catch (err) {
      console.error('加载数据失败:', err)
      setError(err.message || '加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    totalResults,
    expandedKeywords
  }
}

/**
 * 获取生长阶段数据
 */
export function useGrowthStages() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await api.get('/api/knowledge/growth-stages')
        setData(response.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStages()
  }, [])

  return { data, loading, error }
}

/**
 * 获取病害数据
 */
export function useDiseases() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await api.get('/api/knowledge/diseases')
        setData(response.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDiseases()
  }, [])

  return { data, loading, error }
}

/**
 * 获取营养缺乏数据
 */
export function useNutrientDeficiencies() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        const response = await api.get('/api/knowledge/nutrients')
        setData(response.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNutrients()
  }, [])

  return { data, loading, error }
}
