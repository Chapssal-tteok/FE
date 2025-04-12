import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
  newPassword: z.string()
    .min(8, "새 비밀번호는 최소 8자 이상이어야 합니다")
    .regex(/[a-z]/, "소문자를 포함해야 합니다")
    .regex(/[0-9]/, "숫자를 포함해야 합니다"),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "새 비밀번호가 일치하지 않습니다",
  path: ["confirmNewPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface PasswordChangeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>
}

export function PasswordChangeDialog({ isOpen, onOpenChange, onSubmit }: PasswordChangeDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitForm = async (data: PasswordFormData) => {
    try {
      await onSubmit(data.currentPassword, data.newPassword)
      reset()
      onOpenChange(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Password change error:", error.message)
      } else {
        console.error("Password change error:", error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>비밀번호 변경</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              aria-invalid={errors.currentPassword ? "true" : "false"}
              aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
            />
            {errors.currentPassword && (
              <p id="currentPassword-error" className="text-sm text-red-500" role="alert">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              aria-invalid={errors.newPassword ? "true" : "false"}
              aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
            />
            {errors.newPassword && (
              <p id="newPassword-error" className="text-sm text-red-500" role="alert">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              {...register("confirmNewPassword")}
              aria-invalid={errors.confirmNewPassword ? "true" : "false"}
              aria-describedby={errors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
            />
            {errors.confirmNewPassword && (
              <p id="confirmNewPassword-error" className="text-sm text-red-500" role="alert">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "shadow bg-white text-lime-600 hover:bg-lime-400 hover:text-white",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "변경 중..." : "변경"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 