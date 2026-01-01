export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-600">Setting up your preferences...</p>
      </div>
    </div>
  )
}
