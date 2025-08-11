"use client"
import { useMemo } from "react"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/layout"
import ProtectedRoute from "@/components/protected-route"
import { useLegalDocuments } from "@/hooks/use-legal-documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle, Save } from "lucide-react"

// Dynamically import JoditEditor to ensure it's only rendered on the client side
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false })

export default function LegalDocumentsPage() {
  const {
    privacyPolicyContent,
    setPrivacyPolicyContent,
    termsConditionsContent,
    setTermsConditionsContent,
    loading,
    saving,
    error,
    saveContent,
    refetch,
  } = useLegalDocuments()

  const editorConfig = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/classes/Config.html
      height: 500,
      toolbarAdaptive: false,
      buttons:
        "bold,italic,underline,strikethrough,|,ul,ol,|,font,fontsize,paragraph,lineHeight,|,align,indent,outdent,|,link,image,table,|,hr,eraser,copyformat,cut,copy,paste,selectall,|,undo,redo,|,source,fullsize",
      buttonsMD:
        "bold,italic,underline,strikethrough,|,ul,ol,|,font,fontsize,paragraph,lineHeight,|,align,indent,outdent,|,link,image,table,|,hr,eraser,copyformat,cut,copy,paste,selectall,|,undo,redo,|,source,fullsize",
      buttonsSM:
        "bold,italic,underline,strikethrough,|,ul,ol,|,font,fontsize,paragraph,lineHeight,|,align,indent,outdent,|,link,image,table,|,hr,eraser,copyformat,cut,copy,paste,selectall,|,undo,redo,|,source,fullsize",
      buttonsXS:
        "bold,italic,underline,strikethrough,|,ul,ol,|,font,fontsize,paragraph,lineHeight,|,align,indent,outdent,|,link,image,table,|,hr,eraser,copyformat,cut,copy,paste,selectall,|,undo,redo,|,source,fullsize",
    }),
    [],
  )

  const handleSavePrivacyPolicy = async () => {
    try {
      await saveContent({ privacyPolicy: privacyPolicyContent })
    } catch (err) {
      // Error handled by hook's toast
    }
  }

  const handleSaveTermsConditions = async () => {
    try {
      await saveContent({ termsConditions: termsConditionsContent })
    } catch (err) {
      // Error handled by hook's toast
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Legal Documents</h3>
        </div> */}

        <Card>
          <CardHeader>
            <CardTitle>Manage Privacy Policy & Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-20 text-red-500">
                <AlertTriangle className="h-10 w-10 mb-4" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={refetch}>
                  Try Again
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="privacy-policy" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="privacy-policy">Privacy Policy</TabsTrigger>
                  <TabsTrigger value="terms-conditions">Terms and Conditions</TabsTrigger>
                </TabsList>
                <TabsContent value="privacy-policy" className="mt-4">
                  <div className="space-y-4">
                    <JoditEditor
                      value={privacyPolicyContent}
                      config={editorConfig}
                      onBlur={(newContent) => setPrivacyPolicyContent(newContent)}
                      onChange={(newContent) => {}} // Jodit's onChange is too frequent, use onBlur for state updates
                    />
                    <Button onClick={handleSavePrivacyPolicy} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {saving ? "Saving Privacy Policy..." : "Save Privacy Policy"}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="terms-conditions" className="mt-4">
                  <div className="space-y-4">
                    <JoditEditor
                      value={termsConditionsContent}
                      config={editorConfig}
                      onBlur={(newContent) => setTermsConditionsContent(newContent)}
                      onChange={(newContent) => {}}
                    />
                    <Button onClick={handleSaveTermsConditions} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {saving ? "Saving Terms and Conditions..." : "Save Terms and Conditions"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
