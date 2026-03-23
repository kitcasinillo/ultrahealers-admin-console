// API definitions for Email Campaigns (Using fetch + Mock Data)

// Points to the public/data/ folder for mock data
const API_URL = '/data' // Invite's dev server, / points to public/

export const getCampaigns = (filters?: Record<string, string | undefined>) =>
  fetch(`${API_URL}/campaigns.json`).then(async res => {
    if (!res.ok) throw new Error("Failed to load mock data")
    const data = await res.json()
    return { data } // Axios compatibility: wrapping in 'data'
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

export const updateCampaign = (id: string, data: Record<string, unknown>) =>
  Promise.resolve({ data: { success: true, message: "Mock Update" } })

export const deleteCampaign = (id: string) =>
  Promise.resolve({ data: { success: true } })

export const sendCampaign = (id: string) =>
  Promise.resolve({ data: { success: true } })

export const sendTestEmail = (id: string, email: string) =>
  Promise.resolve({ data: { success: true } })

export const getAudiencePreview = (filters: Record<string, unknown>) =>
  Promise.resolve({ data: { count: 1250 } })
