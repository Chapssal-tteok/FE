import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AccountDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (password: string) => Promise<void>
}

export function AccountDeleteDialog({ isOpen, onOpenChange, onConfirm }: AccountDeleteDialogProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    try {
      await onConfirm(password)
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message || "회원 탈퇴 중 오류가 발생했습니다.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>
        </DialogHeader>
        <p>회원 탈퇴를 진행하면 계정이 완전히 삭제됩니다.</p>
        <div className="space-y-4">
          <Label htmlFor="deletePassword">비밀번호 입력</Label>
          <Input
            id="deletePassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DialogFooter className="mt-4">
          <Button variant="destructive" onClick={handleSubmit}>회원 탈퇴</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 