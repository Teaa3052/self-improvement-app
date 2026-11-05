import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import FieldError from "@/components/FieldError"
import AuthLayout, { AuthError, AuthInput, AuthNotice, PasswordToggle } from "@/components/AuthLayout"

function Login() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting }, // isSubmitting = true dok čekamo odgovor backenda
    } = useForm()

    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const [passwordShown, setPasswordShown] = useState(false)

    // Register nas šalje ovamo s porukom da je račun napravljen
    const justRegistered = location.state?.justRegistered

    const onSubmit = async (data) => {
        try {
            await login(data.email, data.password)
            navigate("/dashboard")
        } catch (error) {
            setError("root", { message: error.response?.data?.message || error.message || "Login failed" })
        }
    }

    // izgled: kartica na sredini ekrana, ista kao na registraciji
    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to check off today's habits."
            footer={<>New here? <Link to="/register" className="font-semibold text-foreground underline underline-offset-[3px]">Create an account</Link></>}
        >
            {justRegistered && !errors.root && <AuthNotice>Account created. Log in to get started.</AuthNotice>}

            {/* greška s backenda, npr. "Invalid email or password" */}
            {errors.root && <AuthError>{errors.root.message}</AuthError>}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
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
                            type={passwordShown ? "text" : "password"}
                            className="pr-[52px]"
                            aria-invalid={!!errors.password}
                            {...register("password", { required: "Password is required" })}
                        />
                        <PasswordToggle
                            shown={passwordShown}
                            onToggle={() => setPasswordShown(!passwordShown)}
                            label="Show password"
                        />
                    </div>
                    <FieldError error={errors.password} />
                </div>

                {/* gumb je onemogućen dok čekamo odgovor, da se zahtjev ne pošalje dvaput */}
                <Button
                    type="submit"
                    className="mt-1.5 h-12 w-full rounded-xl text-base font-semibold disabled:bg-neutral-500 disabled:opacity-100"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Logging in…" : "Log in"}
                </Button>
            </form>
        </AuthLayout>
    )
}

export default Login
