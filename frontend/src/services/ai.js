import api from './api'

/**
 * AI 问诊服务
 */
export const aiConsultationApi = {
  /**
   * AI 智能问诊
   * @param {string} query - 用户问题
   * @param {string} userId - 用户 ID
   * @returns {Promise} 诊断结果
   */
  consult: async (query, userId = 'default') => {
    return api.post('/api/ai/consult', {
      query,
      user_id: userId
    })
  },

  /**
   * 获取问诊历史
   * @param {string} userId - 用户 ID
   * @param {number} limit - 返回数量限制
   * @returns {Promise} 历史记录列表
   */
  getHistory: async (userId = 'default', limit = 10) => {
    return api.get('/api/ai/consult/history', {
      params: { user_id: userId, limit }
    })
  },

  /**
   * 获取上下文
   * @param {string} userId - 用户 ID
   * @returns {Promise} 上下文列表
   */
  getContext: async (userId = 'default') => {
    return api.get('/api/ai/consult/context', {
      params: { user_id: userId }
    })
  },

  /**
   * 清除上下文
   * @param {string} userId - 用户 ID
   * @returns {Promise}
   */
  clearContext: async (userId = 'default') => {
    return api.delete('/api/ai/consult/context', {
      params: { user_id: userId }
    })
  },

  /**
   * 快速诊断
   * @param {string} symptom - 症状关键词
   * @returns {Promise} 诊断结果
   */
  quickDiagnosis: async (symptom) => {
    return api.get(`/api/ai/quick-diagnosis/${symptom}`)
  },

  /**
   * 删除单条历史记录
   * @param {string} recordId - 记录 ID
   * @returns {Promise}
   */
  deleteHistory: async (recordId) => {
    return api.delete(`/api/ai/consult/history/${recordId}`)
  }
}

export default aiConsultationApi
