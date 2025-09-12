"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Brain, AlertTriangle, Target, Zap, RefreshCw } from "lucide-react"

export function AIInsights() {
  const [predictions, setPredictions] = useState({
    predictedAPY: 9.2,
    confidence: 85,
    recommendation: "increase_exposure",
    newHedgeRatio: 35,
    reasoning: [
      "Market volatility decreasing, favorable for higher exposure",
      "AI model predicts 0.8% APY increase over next 7 days",
      "Cross-chain opportunities emerging on BNB Chain",
    ],
  })

  const [isLoading, setIsLoading] = useState(false)

  // Mock prediction data
  const predictionData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    predicted: predictions.predictedAPY + Math.sin(i * 0.5) * 0.3,
    current: 8.45 + Math.sin(i * 0.3) * 0.2,
    confidence: Math.max(70, predictions.confidence + Math.random() * 10 - 5),
  }))

  const marketAnalysis = [
    { metric: "TVL Growth", value: 15.2, trend: "up" },
    { metric: "Volatility", value: 12.8, trend: "down" },
    { metric: "Liquidity", value: 89.5, trend: "up" },
    { metric: "Competition", value: 6.3, trend: "stable" },
  ]

  const refreshPredictions = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setPredictions((prev) => ({
      ...prev,
      predictedAPY: prev.predictedAPY + (Math.random() - 0.5) * 0.5,
      confidence: Math.max(70, Math.min(95, prev.confidence + (Math.random() - 0.5) * 10)),
    }))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Yield Optimizer</h3>
                <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={refreshPredictions} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Yield Prediction
            </CardTitle>
            <CardDescription>AI-powered 7-day yield forecast with confidence intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{predictions.predictedAPY.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Predicted APY (7-day average)</div>
                <Badge variant={predictions.confidence > 80 ? "default" : "secondary"} className="mt-2">
                  {predictions.confidence}% Confidence
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Model Confidence</span>
                  <span>{predictions.confidence}%</span>
                </div>
                <Progress value={predictions.confidence} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Rebalancing Recommendation
            </CardTitle>
            <CardDescription>Optimal strategy adjustments based on AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action:</strong> {predictions.recommendation.replace("_", " ").toUpperCase()}
                  <br />
                  <strong>New Hedge Ratio:</strong> {predictions.newHedgeRatio}%
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">AI Reasoning:</h4>
                <ul className="space-y-1">
                  {predictions.reasoning.map((reason, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full">Apply Recommendation</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Yield Forecast</CardTitle>
          <CardDescription>Predicted vs current APY with confidence bands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Current APY"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Predicted APY"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
          <CardDescription>Key metrics influencing AI predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {marketAnalysis.map((item, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-1">
                  {item.value}
                  {item.metric.includes("Growth") || item.metric.includes("Volatility") ? "%" : ""}
                </div>
                <div className="text-sm text-muted-foreground mb-2">{item.metric}</div>
                <Badge
                  variant={item.trend === "up" ? "default" : item.trend === "down" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {item.trend === "up" ? "↗" : item.trend === "down" ? "↘" : "→"} {item.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
