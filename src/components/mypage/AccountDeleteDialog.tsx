import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

const deleteAccountSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요"),
})

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>

interface AccountDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (password: string) => Promise<void>
}

export function AccountDeleteDialog({ isOpen, onOpenChange, onConfirm }: AccountDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  })

  const onSubmit = async (data: DeleteAccountFormData) => {
    try {
      setIsDeleting(true)
      await onConfirm(data.password)
      reset()
      onOpenChange(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Account deletion error:", error.message)
      } else {
        console.error("Account deletion error:", error)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>계정 삭제</DialogTitle>
          <DialogDescription className="pt-2">
            <p className="text-red-600 font-medium mb-2">⚠️ 주의</p>
            <p>
              이 작업은 실행 취소할 수 없습니다.
              <br />
              모든 기록과 계정이 영구적으로 삭제됩니다.
            </p>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deletePassword">비밀번호 확인</Label>
            <Input
              id="deletePassword"
              type="password"
              {...register("password")}
              disabled={isDeleting}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "deletePassword-error" : undefined}
            />
            {errors.password && (
              <p id="deletePassword-error" className="text-sm text-red-500" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="flex-1"
              aria-label="계정 삭제 취소"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeleting}
              className={cn(
                "flex-1",
                isDeleting && "opacity-50 cursor-not-allowed"
              )}
              aria-label="계정 삭제"
              aria-busy={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "계정 삭제"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 