import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteAllRecordsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteAllRecordsDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: DeleteAllRecordsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>모든 기록 삭제</DialogTitle>
          <DialogDescription>
            정말로 모든 자기소개서와 면접 기록을 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="flex-1"
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 