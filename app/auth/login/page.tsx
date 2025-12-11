import type React from "react"
import LoginForm from "./login-form"

type LoginPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Handle both Promise and plain object for compatibility
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams
  
  const redirectTo = typeof resolvedSearchParams?.redirectTo === "string" ? resolvedSearchParams.redirectTo : null
  const error = typeof resolvedSearchParams?.error === "string" ? resolvedSearchParams.error : null

  return <LoginForm redirectTo={redirectTo} initialError={error} />
}
