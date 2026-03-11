import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, User, Tag, DollarSign, Clock, Settings } from "lucide-react"

export function ListingDetail() {
    const { id } = useParams()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/listings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-tight">Chakra Balancing Session</h2>
                        <Badge variant="outline">Active</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">Listing ID: {id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">Preview</Button>
                    <Button variant="destructive">Hide Listing</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full lg:col-span-2 space-y-6">
                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-lg">Listing Details</h3>

                        <div className="grid grid-cols-2 gap-y-4 mb-6">
                            <div>
                                <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4" /> Healer
                                </span>
                                <span className="font-medium text-primary cursor-pointer hover:underline">John Doe</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                    <Tag className="h-4 w-4" /> Category
                                </span>
                                <span className="font-medium">Energy Healing</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                    <DollarSign className="h-4 w-4" /> Price
                                </span>
                                <span className="font-medium">$150.00</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4" /> Duration
                                </span>
                                <span className="font-medium">60 minutes</span>
                            </div>
                        </div>

                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                        <p className="text-sm leading-relaxed mb-6">
                            A comprehensive chakra balancing session focused on clearing energy blockages and restoring natural flow.
                            This remote session utilizes traditional reiki methods combined with intuitive energy reading to identify
                            stagnant areas. Expect to feel lighter, more centered, and emotionally clear post-session.
                        </p>

                        <h4 className="font-medium text-sm text-muted-foreground mb-2 mt-4">Required Information from Seeker</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            <li>Current physical or emotional concerns</li>
                            <li>Intentions for the session</li>
                            <li>Date of birth</li>
                        </ul>
                    </div>

                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Revision History</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-4 last:border-0 border-border">
                                <div>
                                    <p className="text-sm font-medium">Price updated to $150</p>
                                    <p className="text-xs text-muted-foreground">by John Doe</p>
                                </div>
                                <span className="text-xs text-muted-foreground">Oct 12, 2025</span>
                            </div>
                            <div className="flex justify-between border-b pb-4 last:border-0 border-border">
                                <div>
                                    <p className="text-sm font-medium">Description changes approved</p>
                                    <p className="text-xs text-muted-foreground">by Admin System</p>
                                </div>
                                <span className="text-xs text-muted-foreground">Feb 15, 2025</span>
                            </div>
                            <div className="flex justify-between border-b pb-4 last:border-0 border-border">
                                <div>
                                    <p className="text-sm font-medium">Listing Created</p>
                                    <p className="text-xs text-muted-foreground">by John Doe</p>
                                </div>
                                <span className="text-xs text-muted-foreground">Feb 10, 2025</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-full lg:col-span-1 space-y-6">
                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5" /> Admin Controls
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Override Status</label>
                                <select className="w-full border rounded-md p-2 bg-background text-sm">
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending Review</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Hidden">Hidden (Admin Override)</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">Changes are saved automatically.</p>
                            </div>

                            <div className="pt-4 border-t">
                                <label className="text-sm font-medium mb-1 block">Commission Rate Rewrite</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="20" className="border rounded-md p-2 bg-background text-sm w-full" />
                                    <span className="text-sm font-medium">%</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Leave blank to use global default (15%).</p>
                            </div>

                            <div className="pt-4 border-t">
                                <Button className="w-full" variant="outline">Save Configuration</Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Performance Metrics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total Bookings</span>
                                <span className="font-medium bg-muted px-2 py-1 rounded">244</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Completion Rate</span>
                                <span className="font-medium bg-muted px-2 py-1 rounded">98%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t pt-3">
                                <span className="text-muted-foreground">Earned (All Time)</span>
                                <span className="font-medium">$36,600.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
