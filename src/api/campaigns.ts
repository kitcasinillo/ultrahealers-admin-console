// API definitions for Email Campaigns (Using fetch + Mock Data)

// Points to the public/data/ folder for mock data
const API_URL = '/data' // Invite's dev server, / points to public/

export const getCampaigns = (filters?: Record<string, string | undefined>) =>
  fetch(`${API_URL}/campaigns.json`).then(async res => {
    if (!res.ok) throw new Error("Failed to load mock data")
    const data = await res.json()
    
    // Client-side filtering for mock data
    let campaigns = (data.campaigns || data || []) as any[]
    
    if (filters) {
      if (filters.search) {
        const query = filters.search.toLowerCase()
        campaigns = campaigns.filter(c => 
          (c.name || c.title || "").toLowerCase().includes(query) ||
          (c.subject || "").toLowerCase().includes(query)
        )
      }
      
      if (filters.status && filters.status !== "All") {
        campaigns = campaigns.filter(c => 
          (c.status || "").toLowerCase() === filters.status?.toLowerCase()
        )
      }
      
      if (filters.audience && filters.audience !== "All") {
        campaigns = campaigns.filter(c => 
          (c.audience || "").toLowerCase() === filters.audience?.toLowerCase()
        )
      }

      if (filters.createdBy) {
        const query = filters.createdBy.toLowerCase()
        campaigns = campaigns.filter(c => 
          (c.createdBy || "").toLowerCase().includes(query)
        )
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime()
        campaigns = campaigns.filter(c => {
          if (!c.sentAt) return false
          const sent = new Date(c.sentAt).getTime()
          return sent >= start
        })
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime()
        campaigns = campaigns.filter(c => {
          if (!c.sentAt) return false
          const sent = new Date(c.sentAt).getTime()
          return sent <= end
        })
      }
    }

    // Axios compatibility wrapping in 'data'
    return { data: { campaigns, total: campaigns.length, success: true } }
  })

export const getCampaign = (id: string) =>
  fetch(`${API_URL}/campaigns.json`).then(async res => {
    if (!res.ok) throw new Error("Failed to load mock data")
    const data = await res.json()
    const campaigns = data.campaigns || []
    const campaign = campaigns.find((c: any) => c.id === id)
    return { data: { campaign, success: true } } // Axios compatibility: wrapping in 'data'
  })

export const createCampaign = (data: Record<string, unknown>) =>
  Promise.resolve({ data: { success: true, campaignId: "mock-id", campaign: { id: "mock-id", ...data } } })

export const updateCampaign = (_id: string, data: Record<string, unknown>) =>
  Promise.resolve({ data: { success: true, message: "Mock Update", _id, data } })

export const deleteCampaign = (_id: string) =>
  Promise.resolve({ data: { success: true, _id } })

export const sendCampaign = (_id: string) =>
  Promise.resolve({ data: { success: true, _id } })

export const sendTestEmail = (_id: string, _email: string) =>
  Promise.resolve({ data: { success: true, _id, _email } })

export const getAudiencePreview = (_filters: Record<string, unknown>) =>
  Promise.resolve({ data: { count: 1250, _filters } })
