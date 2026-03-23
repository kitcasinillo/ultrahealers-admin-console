import { useState, useEffect } from "react"
import type { Booking } from "../lib/bookings"

export function useBookings(isRetreat: boolean = false) {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const endpoint = isRetreat ? '/api/retreat-bookings' : '/api/bookings';
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`)
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
    }, [isRetreat])

    const cancelBooking = async (id: string) => {
        try {
            const endpoint = isRetreat ? `/api/retreat-bookings/cancel/${id}` : `/api/bookings/cancel/${id}`;
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST'
            })
            const result = await response.json()
            if (result.success) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'cancelled' } : b))
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
