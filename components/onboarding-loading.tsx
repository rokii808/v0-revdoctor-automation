export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading preferences...</p>
      </div>
    </div>
  )
}
