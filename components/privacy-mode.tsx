"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Eye, EyeOff, Lock, CheckCircle, Zap, UserCheck } from "lucide-react"

interface PrivacySettings {
  zkMeVerified: boolean
  privateTransactions: boolean
  hiddenBalances: boolean
  anonymousMode: boolean
}

export function PrivacyMode() {
  const { address, isConnected } = useAccount()
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    zkMeVerified: false,
    privateTransactions: false,
    hiddenBalances: false,
    anonymousMode: false,
  })

  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStep, setVerificationStep] = useState(0)

  // REAL DATA PERSISTENCE - Load user's privacy settings
  useEffect(() => {
    if (isConnected && address) {
      const savedSettings = localStorage.getItem(`privacySettings_${address}`)
      if (savedSettings) {
        setPrivacySettings(JSON.parse(savedSettings))
      }
    }
  }, [isConnected, address])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem(`privacySettings_${address}`, JSON.stringify(privacySettings))
    }
  }, [privacySettings, isConnected, address])

  const handleZkMeVerification = async () => {
    setIsVerifying(true)
    setVerificationStep(0)

    // Simulate zkMe verification process
    const steps = [
      "Connecting to zkMe network...",
      "Generating zero-knowledge proof...",
      "Validating identity credentials...",
      "Completing verification...",
    ]

    for (let i = 0; i < steps.length; i++) {
      setVerificationStep(i)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    setPrivacySettings((prev) => ({ ...prev, zkMeVerified: true }))
    setIsVerifying(false)
  }

  const togglePrivacySetting = (setting: keyof PrivacySettings) => {
    if (setting !== "zkMeVerified") {
      setPrivacySettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }))
    }
  }

  const privacyScore = Object.values(privacySettings).filter(Boolean).length * 25

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Card className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security Center
          </CardTitle>
          <CardDescription>Manage your privacy settings and zero-knowledge verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-green-400">{privacyScore}%</div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">Privacy Score</div>
            </div>
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-blue-400">
                {privacySettings.zkMeVerified ? "Verified" : "Pending"}
              </div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">zkMe Status</div>
            </div>
            <div className="text-center p-4 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
              <div className="text-2xl font-bold text-yellow-400">
                {privacySettings.privateTransactions ? "ON" : "OFF"}
              </div>
              <div className="text-sm text-white/60 dark:text-white/60 text-slate-600">Private Mode</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Privacy Configuration</span>
              <span>{privacyScore}%</span>
            </div>
            <Progress value={privacyScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="verification" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl p-1">
          <TabsTrigger value="verification" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">
            <UserCheck className="w-4 h-4" />
            zkMe Verification
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">
            <Shield className="w-4 h-4" />
            Privacy Settings
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 dark:text-white/70 text-slate-600 rounded-xl">
            <Lock className="w-4 h-4" />
            Private Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          <Card className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle>zkMe Identity Verification</CardTitle>
              <CardDescription>
                Verify your identity using zero-knowledge proofs for enhanced privacy and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!privacySettings.zkMeVerified ? (
                <>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      zkMe verification enables private transactions while maintaining regulatory compliance. Your
                      personal data never leaves your device.
                    </AlertDescription>
                  </Alert>

                  {isVerifying ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Zap className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                        <h3 className="text-lg font-semibold mb-2">Verifying Identity</h3>
                        <p className="text-muted-foreground">
                          {
                            [
                              "Connecting to zkMe network...",
                              "Generating zero-knowledge proof...",
                              "Validating identity credentials...",
                              "Completing verification...",
                            ][verificationStep]
                          }
                        </p>
                      </div>
                      <Progress value={(verificationStep + 1) * 25} className="h-2" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Identity Not Verified</h3>
                        <p className="text-muted-foreground mb-4">
                          Complete zkMe verification to unlock private transaction features
                        </p>
                        <Button onClick={handleZkMeVerification} className="w-full">
                          Start zkMe Verification
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 mb-2">Identity Verified</h3>
                    <p className="text-muted-foreground">
                      Your identity has been verified using zero-knowledge proofs. You can now use private transaction
                      features.
                    </p>
                  </div>
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    zkMe Verified
                  </Badge>
                </div>
              )}

              {/* Verification Benefits */}
              <div className="space-y-3">
                <h4 className="font-semibold">Verification Benefits:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-sm">Private Transactions</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm">Enhanced Security</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm">Anonymous Mode</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm">Lower Fees</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Configure your privacy preferences and transaction visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Private Transactions */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Private Transactions</span>
                    {!privacySettings.zkMeVerified && (
                      <Badge variant="outline" className="text-xs">
                        Requires Verification
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hide transaction amounts and recipients using zero-knowledge proofs
                  </p>
                </div>
                <Switch
                  checked={privacySettings.privateTransactions}
                  onCheckedChange={() => togglePrivacySetting("privateTransactions")}
                  disabled={!privacySettings.zkMeVerified}
                />
              </div>

              {/* Hidden Balances */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    <span className="font-medium">Hidden Balances</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Hide your vault balances from public view</p>
                </div>
                <Switch
                  checked={privacySettings.hiddenBalances}
                  onCheckedChange={() => togglePrivacySetting("hiddenBalances")}
                />
              </div>

              {/* Anonymous Mode */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Anonymous Mode</span>
                    {!privacySettings.zkMeVerified && (
                      <Badge variant="outline" className="text-xs">
                        Requires Verification
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hide your identity from leaderboards and community features
                  </p>
                </div>
                <Switch
                  checked={privacySettings.anonymousMode}
                  onCheckedChange={() => togglePrivacySetting("anonymousMode")}
                  disabled={!privacySettings.zkMeVerified}
                />
              </div>

              {/* Privacy Score */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-center">
                    <span>
                      Your privacy score: <strong>{privacyScore}%</strong>
                    </span>
                    <Badge variant={privacyScore >= 75 ? "default" : privacyScore >= 50 ? "secondary" : "destructive"}>
                      {privacyScore >= 75 ? "High Privacy" : privacyScore >= 50 ? "Medium Privacy" : "Low Privacy"}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-white/10 dark:bg-white/10 bg-slate-200/50 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle>Private Transaction History</CardTitle>
              <CardDescription>View your private transactions (only visible to you)</CardDescription>
            </CardHeader>
            <CardContent>
              {privacySettings.zkMeVerified && privacySettings.privateTransactions ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Private Deposit</div>
                        <div className="text-sm text-muted-foreground">2 hours ago</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">*** USDT</div>
                      <Badge variant="secondary" className="text-xs">
                        Private
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Private Withdrawal</div>
                        <div className="text-sm text-muted-foreground">1 day ago</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">*** USDT</div>
                      <Badge variant="secondary" className="text-xs">
                        Private
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Private transactions are not enabled.</p>
                  <p className="text-sm">
                    {!privacySettings.zkMeVerified
                      ? "Complete zkMe verification to enable private transactions."
                      : "Enable private transactions in settings to see private history."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wallet Connection Prompt */}
      {!isConnected && (
        <div className="text-center p-8 bg-gradient-to-br from-purple-500/10 to-blue-600/10 rounded-2xl border border-purple-500/20">
          <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Wallet for Privacy Features</h3>
          <p className="text-white/60">Connect your wallet to access privacy settings and zkMe verification</p>
        </div>
      )}
    </div>
  )
}
