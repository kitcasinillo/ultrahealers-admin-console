import { useState, useEffect } from "react"
import type { Booking } from "../lib/bookings"

export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`)
            const result = await response.json()
            if (result.success) {
                setBookings(result.data)
                setError(null);
            } else {
                setError(result.message || "Failed to fetch bookings");
            }
        } catch (err: any) {
            console.error("Error fetching bookings:", err)
            setError(err.message || "Something went wrong fetching bookings");
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const cancelBooking = async (id: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, {
                method: 'DELETE'
            })
            const result = await response.json()
            if (result.success) {
                setBookings(prev => prev.filter(b => b.id !== id))
                return true
            }
            return false
        } catch (err) {
            console.error("Error cancelling booking:", err)
            return false
        }
    }

    return { bookings, loading, error, refetch: fetchBookings, cancelBooking }
}
