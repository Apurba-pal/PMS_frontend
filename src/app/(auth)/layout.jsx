export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
//     <div className="relative min-h-screen bg-black text-white overflow-hidden">
//   <div className="absolute -top-40 left-20 h-[400px] w-[400px] bg-yellow-400/10 blur-[120px]" />
//   {children}
// </div>
  );
}
