import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { api } from "@/api/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import FieldError from "@/components/FieldError"
import AuthLayout, { AuthError, AuthInput, PasswordToggle } from "@/components/AuthLayout"

function Register() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting }, // isSubmitting = true dok čekamo odgovor backenda
    } = useForm()

    const navigate = useNavigate()
    const [passwordsShown, setPasswordsShown] = useState(false) // oko prikazuje oba polja za lozinku

    const onSubmit = async (data) => {
        try {
            await api.post('/auth/register', {
                nickname: data.nickname,
                email: data.email,
                password: data.password,
            })
            // state putuje uz adresu, pa Login može pokazati poruku da je račun napravljen
            navigate("/login", { state: { justRegistered: true } })
        } catch (error) {
            setError("root", { message: error.response?.data?.message || "Registration failed" })
        }
    }

    const passwordType = passwordsShown ? "text" : "password"

    // pravila u formi su ista kao u zod shemi na backendu, da korisnik grešku vidi odmah, bez slanja zahtjeva
    return (
        <AuthLayout
            title="Create your account"
            subtitle="It takes a minute. Then add your first habit."
            footer={<>Already have an account? <Link to="/login" className="font-semibold text-foreground underline underline-offset-[3px]">Log in</Link></>}
        >
            {/* greška s backenda, npr. "User already exists" */}
            {errors.root && <AuthError>{errors.root.message}</AuthError>}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="nickname" className="font-semibold">Nickname</Label>
                    <AuthInput
                        id="nickname"
                        aria-invalid={!!errors.nickname}
                        {...register("nickname", {
                            required: "Nickname is required",
                            maxLength: { value: 50, message: "Nickname is too long" },
                        })}
                    />
                    <FieldError error={errors.nickname} />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <AuthInput
                        id="email"
                        type="email"
                        aria-invalid={!!errors.email}
                        {...register("email", { required: "Email is required" })}
                    />
                    <FieldError error={errors.email} />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="font-semibold">Password</Label>
                    <div className="relative">
                        <AuthInput
                            id="password"
                            type={passwordType}
                            className="pr-[52px]"
                            aria-invalid={!!errors.password}
                            aria-describedby="password-hint"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 8, message: "Password must be at least 8 characters" },
                                maxLength: { value: 72, message: "Password is too long" },
                            })}
                        />
                        <PasswordToggle
                            shown={passwordsShown}
                            onToggle={() => setPasswordsShown(!passwordsShown)}
                            label="Show passwords"
                        />
                    </div>
                    {/* pravilo se vidi prije upisa, a kod greške isti red pocrveni */}
                    <p
                        id="password-hint"
                        className={cn("text-[13px] leading-[1.4]", errors.password ? "font-semibold text-red-700" : "text-[#636363]")}
                    >
                        {errors.password?.message ?? "At least 8 characters"}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword" className="font-semibold">Repeat password</Label>
                    <AuthInput
                        id="confirmPassword"
                        type={passwordType}
                        aria-invalid={!!errors.confirmPassword}
                        {...register("confirmPassword", {
                            required: "Please repeat your password",
                            // formValues = sve vrijednosti forme, pa usporedimo s upisanom lozinkom
                            validate: (value, formValues) =>
                                value === formValues.password || "Passwords do not match",
                        })}
                    />
                    <FieldError error={errors.confirmPassword} />
                </div>

                {/* gumb je onemogućen dok čekamo odgovor, da se zahtjev ne pošalje dvaput */}
                <Button
                    type="submit"
                    className="mt-1.5 h-12 w-full rounded-xl text-base font-semibold disabled:bg-neutral-500 disabled:opacity-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
            </form>
        </AuthLayout>
    )
}

export default Register
