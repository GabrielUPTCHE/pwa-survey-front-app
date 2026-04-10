export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-emerald-100/50 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-50 bg-emerald-50/30 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-bold text-emerald-900 ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);