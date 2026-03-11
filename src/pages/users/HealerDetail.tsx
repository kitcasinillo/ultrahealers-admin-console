import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, User, Mail, MapPin, Calendar, Star, MoreVertical } from "lucide-react"

export function HealerDetail() {
    const { id } = useParams()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/users/healers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">Healer Details</h2>
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
                        <h3 className="text-xl font-bold">John Doe</h3>
                        <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.9 (124 reviews)
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Badge variant="outline">Active</Badge>
                            <Badge>Premium 🏅</Badge>
                        </div>

                        <div className="mt-6 space-y-3 text-sm text-left border-t pt-6">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>john@example.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>San Francisco, CA</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Joined Jan 2025</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Financial Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground text-sm">Total Earned</span>
                                <span className="font-medium">$15,400</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground text-sm">Pending Payout</span>
                                <span className="font-medium">$850</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground text-sm">Subscription</span>
                                <span className="font-medium">$29/mo</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-full lg:col-span-2 space-y-6">
                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-lg">Bio & Modalities</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            Experienced holistic healer specializing in energy work and sound therapy. Certified practitioner with over 10 years of experience helping clients achieve balance and wellness.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Reiki Master</Badge>
                            <Badge variant="secondary">Sound Healing</Badge>
                            <Badge variant="secondary">Meditation Coach</Badge>
                        </div>
                    </div>

                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-lg">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-4 last:border-0">
                                <div>
                                    <p className="text-sm font-medium">Session Completed</p>
                                    <p className="text-xs text-muted-foreground">with Seeker #1024</p>
                                </div>
                                <span className="text-xs text-muted-foreground">2 hours ago</span>
                            </div>
                            <div className="flex justify-between border-b pb-4 last:border-0">
                                <div>
                                    <p className="text-sm font-medium">Payout Processed</p>
                                    <p className="text-xs text-muted-foreground">$450 to bank account</p>
                                </div>
                                <span className="text-xs text-muted-foreground">2 days ago</span>
                            </div>
                            <div className="flex justify-between pb-4">
                                <div>
                                    <p className="text-sm font-medium">Changed Subscription</p>
                                    <p className="text-xs text-muted-foreground">Upgraded to Premium</p>
                                </div>
                                <span className="text-xs text-muted-foreground">1 week ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
