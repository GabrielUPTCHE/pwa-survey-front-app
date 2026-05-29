export const Table = ({ children, className = "" }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <table className={`w-full text-sm text-left ${className}`}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children }) => (
  <thead className="text-xs text-emerald-800 uppercase bg-emerald-50 border-b border-emerald-100">
    {children}
  </thead>
);

export const Tbody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-100">
    {children}
  </tbody>
);

export const Tr = ({ children, className = "" }) => (
  <tr className={`hover:bg-emerald-50/50 transition-colors ${className}`}>
    {children}
  </tr>
);

export const Th = ({ children, className = "" }) => (
  <th scope="col" className={`px-4 py-3 font-semibold ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 text-gray-600 ${className}`}>
    {children}
  </td>
);