"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, EyeOff, Upload } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-client"
import { updateUserProfile, updateUserPassword, updateUserAvatar } from "@/actions/user-actions"

type PasswordUpdateForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function UserProfile() {
  const [user, setUser] = useState<{ id: string; email: string; fullName: string; avatar?: string } | null>(null)
  const [fullName, setFullName] = useState("")
  const [fullNameError, setFullNameError] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState("")
  const [updateError, setUpdateError] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordUpdateForm>()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setFullName(currentUser.fullName)
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar)
      }
    }
  }, [])

  const handlePasswordUpdate = async (data: PasswordUpdateForm) => {
    if (!user) return

    try {
      setIsUpdating(true)
      setUpdateSuccess("")
      setUpdateError("")

      if (data.newPassword !== data.confirmPassword) {
        setUpdateError("New passwords do not match")
        return
      }

      const result = await updateUserPassword(user.id, data.currentPassword, data.newPassword)

      if (result.success) {
        setUpdateSuccess("Password updated successfully")
        reset()
      } else {
        setUpdateError(result.error || "Current password is incorrect")
      }
    } catch (error) {
      console.error(error)
      setUpdateError("An error occurred while updating password")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validate form
    if (!fullName.trim()) {
      setFullNameError("Full name is required")
      return
    }

    setFullNameError("")

    try {
      setIsUpdating(true)
      setUpdateSuccess("")
      setUpdateError("")

      const result = await updateUserProfile(user.id, { fullName })

      if (result.data) {
        setUser({
          ...user,
          fullName,
        })
        // Update localStorage
        const currentUser = getCurrentUser()
        if (currentUser) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              ...currentUser,
              fullName,
            }),
          )
        }
        setUpdateSuccess("Profile updated successfully")
      } else {
        setUpdateError(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error(error)
      setUpdateError("An error occurred while updating profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return

    try {
      setIsUploadingAvatar(true)
      const result = await updateUserAvatar(user.id, avatarPreview as string)

      if (result.data) {
        setUser({
          ...user,
          avatar: avatarPreview as string,
        })
        // Update localStorage
        const currentUser = getCurrentUser()
        if (currentUser) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              ...currentUser,
              avatar: avatarPreview,
            }),
          )
        }
        setUpdateSuccess("Profile picture updated successfully")
      } else {
        setUpdateError(result.error || "Failed to update profile picture")
      }
    } catch (error) {
      console.error(error)
      setUpdateError("An error occurred while updating profile picture")
    } finally {
      setIsUploadingAvatar(false)
      setAvatarFile(null)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"

    return (
      name
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .toUpperCase()
        .substring(0, 2) || "U"
    )
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} alt={user?.fullName || "User"} />
                <AvatarFallback className="text-lg">{user?.fullName ? getInitials(user.fullName) : "U"}</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-xl font-medium">{user?.fullName}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile Info</TabsTrigger>
                <TabsTrigger value="password">Change Password</TabsTrigger>
                <TabsTrigger value="avatar">Profile Picture</TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="mt-4">
                <form onSubmit={handleSubmit(handlePasswordUpdate)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("currentPassword", { required: "Current password is required" })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="sr-only">{showCurrentPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword", {
                          required: "Please confirm your new password",
                          validate: (value) => value === watch("newPassword") || "Passwords do not match",
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                  </div>

                  {updateSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{updateSuccess}</p>
                    </div>
                  )}

                  {updateError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{updateError}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isUpdating}>
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="profile" className="mt-4">
                <form onSubmit={(e) => handleProfileUpdate(e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={fullNameError ? "border-red-500" : ""}
                    />
                    {fullNameError && <p className="text-sm text-red-500">{fullNameError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled className="bg-gray-50" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  {updateSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{updateSuccess}</p>
                    </div>
                  )}

                  {updateError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{updateError}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isUpdating}>
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="avatar" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatarPreview || undefined} alt={user?.fullName || "User"} />
                      <AvatarFallback className="text-2xl">
                        {user?.fullName ? getInitials(user.fullName) : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-center">
                      <Label
                        htmlFor="avatar"
                        className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  {avatarFile && (
                    <Button onClick={handleAvatarUpload} className="w-full" disabled={isUploadingAvatar}>
                      {isUploadingAvatar ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        "Save Profile Picture"
                      )}
                    </Button>
                  )}

                  {updateSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{updateSuccess}</p>
                    </div>
                  )}

                  {updateError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{updateError}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

