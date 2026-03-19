export interface BookingStatus {
    'invite-email-to-seeker': boolean
    'invite-email-to-healer': boolean
    'booking-confirmed-by-healer': boolean
    'booking-marked-as-complete-by-healer': boolean
    'booking-marked-as-complete-by-seeker': boolean
    'booking-cancelled-by-admin'?: boolean
}

export interface Booking {
    id: string
    listingTitle: string
    healerName: string
    seekerName: string
    seekerEmail?: string
    healerEmail?: string
    amount: number
    currency: string
    sessionDate: any
    sessionTime: any
    status: BookingStatus
    paymentStatus: string
    modality?: string
    createdAt: any
}

/**
 * Universal date/time formatter for Firestore Timestamps and ISO strings.
 */
export const formatDateTime = (val: any, showTime: boolean = false) => {
    if (!val) return "N/A";
    
    // Handle Firestore Timestamps
    if (val && typeof val === 'object' && 'seconds' in val) {
        const date = new Date(val.seconds * 1000);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(showTime && { hour: '2-digit', minute: '2-digit' })
        });
    }

    // Handle ISO strings or other date strings
    if (typeof val === 'string') {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            // Check if it's just a time string (like "08:00")
            if (val.length <= 5 && val.includes(':')) return val;
            
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                ...(showTime && { hour: '2-digit', minute: '2-digit' })
            });
        }
        return val;
    }
    
    return String(val);
}

/**
 * Formats a number as currency.
 */
export const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
    }).format(amount);
}
