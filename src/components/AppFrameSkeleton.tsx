import LoaderSkeleton from "@/components/LoaderSkeleton";

export default function AppFrameSkeleton() {
  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-screen-sm mx-auto px-4 py-4 overflow-x-hidden">
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <header className="bg-gradient-to-b from-gray-200 to-white border-b border-gray-300 shadow-sm">
            <div className="px-2 py-2">
              <LoaderSkeleton />
            </div>
          </header>

          <div className="p-3">
            <LoaderSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
