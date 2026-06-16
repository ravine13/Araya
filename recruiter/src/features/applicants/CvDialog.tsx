import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Candidate } from "@/lib/mock";
import { downloadCvAsPdf } from "@/lib/cvPdf";
import { CvDocument } from "@/components/cv/CvDocument";

export function CvDialog({
  candidate,
  onClose,
}: {
  candidate: Candidate | null;
  onClose: () => void;
}) {
  const isUpload = candidate?.cvSource === "upload" && !!candidate.uploadedCvData;
  const formProfile = candidate?.formProfile;

  return (
    <Dialog open={!!candidate} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden p-0">
        {candidate && (
          <div className="flex h-[85vh] flex-col">
            <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-border p-4">
              <div>
                <DialogTitle className="font-display text-[16px]">
                  CV — {candidate.name}
                </DialogTitle>
                <p className="text-[12px] text-muted-foreground">
                  {candidate.role} · {candidate.specialty}
                  {isUpload ? " · Uploaded file" : " · Form CV"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isUpload && formProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.print()}
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    if (isUpload && candidate.uploadedCvData) {
                      const a = document.createElement("a");
                      a.href = candidate.uploadedCvData;
                      a.download = candidate.uploadedCvName || `${candidate.name}-CV.pdf`;
                      a.click();
                      toast.success("Download started");
                    } else if (formProfile) {
                      downloadCvAsPdf("recruiter-cv-view", `${candidate.name}-CV.pdf`);
                    } else {
                      toast.error("No CV content available");
                    }
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </DialogHeader>

            <Tabs
              defaultValue={isUpload ? "pdf" : "structured"}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="border-b border-border bg-muted/20 px-4 py-2">
                <TabsList>
                  {!isUpload && formProfile && (
                    <TabsTrigger value="structured">Structured CV</TabsTrigger>
                  )}
                  <TabsTrigger value="pdf">{isUpload ? "Uploaded CV" : "Print preview"}</TabsTrigger>
                </TabsList>
              </div>

              {!isUpload && formProfile && (
                <TabsContent value="structured" className="flex-1 overflow-y-auto p-6">
                  <CvDocument profile={formProfile} id="recruiter-cv-view" />
                </TabsContent>
              )}

              <TabsContent value="pdf" className="flex-1 overflow-y-auto bg-muted/40 p-4">
                {isUpload && candidate.uploadedCvData ? (
                  candidate.uploadedCvMime?.includes("pdf") ? (
                    <iframe
                      title="Uploaded CV"
                      src={candidate.uploadedCvData}
                      className="mx-auto h-[70vh] w-full max-w-[640px] rounded-md border bg-white shadow-pop"
                    />
                  ) : (
                    <div className="mx-auto max-w-md rounded-md bg-card p-8 text-center shadow-pop">
                      <p className="text-sm font-medium">{candidate.uploadedCvName}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        DOCX preview not available — use Download.
                      </p>
                    </div>
                  )
                ) : formProfile ? (
                  <div className="mx-auto max-w-[720px]">
                    <CvDocument profile={formProfile} />
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    This candidate applied with an uploaded CV or has not completed their profile
                    yet.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
