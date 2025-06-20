export const SkeletonLoaderContent = () => (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
        <div className="h-10 w-1/3 bg-gray-200 rounded-md" />
        <div className="h-3 w-full rounded-md" />
        <div className="h-3 w-5/6 bg-gray-200 rounded-md" />
        <div className="h-3 w-2/3 bg-gray-200 rounded-md" />
        <div className="h-3 w-1/2 bg-gray-200 rounded-md" />
        <div className="h-3 w-4/5 bg-gray-200 rounded-md" />
    </div>
);  

export const SkeletonLoaderProcessList = () => (
    <div className="flex flex-col gap-1 p-2 animate-pulse">
      {/* Nivel 0 */}
      <div className="flex items-center" style={{ paddingLeft: `${20 * 0}px` }}>
        <div className="w-4 h-4 mr-1 bg-gray-300 rounded-sm" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
  
      {/* Nivel 1 */}
      <div className="flex items-center" style={{ paddingLeft: `${20 * 1}px` }}>
        <div className="w-4 h-4 mr-1 bg-gray-300 rounded-sm" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
      </div>
  
      {/* Nivel 2 */}
      <div className="flex items-center" style={{ paddingLeft: `${20 * 2}px` }}>
        <div className="w-4 h-4 mr-1 bg-gray-300 rounded-sm" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
  
      {/* Otro item nivel 0 */}
      <div className="flex items-center mt-2" style={{ paddingLeft: `${20 * 0}px` }}>
        <div className="w-4 h-4 mr-1 bg-gray-300 rounded-sm" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
      </div>
  
      {/* Nivel 1 */}
      <div className="flex items-center" style={{ paddingLeft: `${20 * 1}px` }}>
        <div className="w-4 h-4 mr-1 bg-gray-300 rounded-sm" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
);  