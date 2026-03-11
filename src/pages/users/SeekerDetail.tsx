import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, User, Mail, MapPin, Calendar, MoreVertical } from "lucide-react"

export function SeekerDetail() {
    const { id } = useParams()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/users/seekers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">Seeker Details</h2>
                    <p className="text-muted-foreground text-sm">ID: {id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">Message</Button>
                    <Button variant="destructive">Suspend</Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full lg:col-span-1 space-y-6">
                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6 text-center">
                        <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">Michael Brown</h3>

                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Badge variant="outline">Active</Badge>
                        </div>

                        <div className="mt-6 space-y-3 text-sm text-left border-t pt-6">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>michael@example.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>Los Angeles, CA</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Joined Jan 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Account Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground text-sm">Total Spent</span>
                                <span className="font-medium">$450</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground text-sm">Sessions Booked</span>
                                <span className="font-medium">3</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground text-sm">Retreats Attended</span>
                                <span className="font-medium">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-full lg:col-span-2 space-y-6">
                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-lg">Booking History</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-4 last:border-0">
                                <div>
                                    <p className="text-sm font-medium">Reiki Healing Session</p>
                                    <p className="text-xs text-muted-foreground">with John Doe</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium block">$150</span>
                                    <span className="text-xs text-muted-foreground">Feb 20, 2026</span>
                                </div>
                            </div>
                            <div className="flex justify-between border-b pb-4 last:border-0">
                                <div>
                                    <p className="text-sm font-medium">Sound Bath</p>
                                    <p className="text-xs text-muted-foreground">with Alice Johnson</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium block">$150</span>
                                    <span className="text-xs text-muted-foreground">Feb 05, 2026</span>
                                </div>
                            </div>
                            <div className="flex justify-between pb-4">
                                <div>
                                    <p className="text-sm font-medium">Initial Consultation</p>
                                    <p className="text-xs text-muted-foreground">with John Doe</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium block">$150</span>
                                    <span className="text-xs text-muted-foreground">Jan 12, 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
