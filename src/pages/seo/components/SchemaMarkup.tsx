import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, MapPin, ShoppingBag, Calendar, MessageSquare, ExternalLink } from "lucide-react";

export function SchemaMarkup() {
    const [schemas, setSchemas] = useState({
        localBusiness: true,
        product: true,
        article: false,
        event: false,
        faq: true
    });

    const toggleSchema = (key: keyof typeof schemas) => {
        setSchemas(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Card className="border border-gray-100 dark:border-white/5 shadow-sm bg-white dark:bg-[#111C44] rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pb-4">
                <CardTitle className="text-lg font-bold text-[#1b254b] dark:text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#4318FF]" />
                    JSON-LD Schema Configurations
                </CardTitle>
                <CardDescription className="text-xs font-medium text-[#A3AED0]">Automate structured data injection to enhance search snippets.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-[#4318FF]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <Label className="font-bold text-[#1b254b] dark:text-white block cursor-pointer">LocalBusiness</Label>
                                <p className="text-[11px] text-[#A3AED0] font-medium italic">Essential for physical healer centers.</p>
                            </div>
                        </div>
                        <Switch checked={schemas.localBusiness} onCheckedChange={() => toggleSchema('localBusiness')} />
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-[#4318FF]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-purple-100 dark:bg-purple-500/10 rounded-lg text-purple-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <Label className="font-bold text-[#1b254b] dark:text-white block cursor-pointer">Product / Service</Label>
                                <p className="text-[11px] text-[#A3AED0] font-medium italic">Rich snippets for reiki & therapy listings.</p>
                            </div>
                        </div>
                        <Switch checked={schemas.product} onCheckedChange={() => toggleSchema('product')} />
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-[#4318FF]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-orange-100 dark:bg-orange-500/10 rounded-lg text-orange-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <Label className="font-bold text-[#1b254b] dark:text-white block cursor-pointer">Event Schema</Label>
                                <p className="text-[11px] text-[#A3AED0] font-medium italic">Google Search dates for yoga retreats.</p>
                            </div>
                        </div>
                        <Switch checked={schemas.event} onCheckedChange={() => toggleSchema('event')} />
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-[#4318FF]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-red-100 dark:bg-red-500/10 rounded-lg text-red-600">
                                <Code className="w-5 h-5" />
                            </div>
                            <div>
                                <Label className="font-bold text-[#1b254b] dark:text-white block cursor-pointer">Article Schema</Label>
                                <p className="text-[11px] text-[#A3AED0] font-medium italic">Boost SEO for blog posts & bio stories.</p>
                            </div>
                        </div>
                        <Switch checked={schemas.article} onCheckedChange={() => toggleSchema('article')} />
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-[#4318FF]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-green-100 dark:bg-green-500/10 rounded-lg text-green-600">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <Label className="font-bold text-[#1b254b] dark:text-white block cursor-pointer">FAQ Section</Label>
                                <p className="text-[11px] text-[#A3AED0] font-medium italic">Inject question-answer snippets.</p>
                            </div>
                        </div>
                        <Switch checked={schemas.faq} onCheckedChange={() => toggleSchema('faq')} />
                    </div>
                </div>

                <div className="mt-8 p-6 bg-[#F4F7FE] dark:bg-white/5 rounded-2xl border border-[#4318FF]/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h5 className="font-bold text-[#1b254b] dark:text-white text-sm">Rich Result Tester</h5>
                        <p className="text-xs text-[#A3AED0] mt-1 font-medium italic">Verify your schema output using Google's official developer tools.</p>
                    </div>
                    <Button variant="outline" className="bg-white dark:bg-[#0B1437] border-gray-100 dark:border-white/10 rounded-xl font-bold text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        Google Rich Results Lab
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
