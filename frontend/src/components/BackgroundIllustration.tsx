export function BackgroundIllustration() {
  return (
    <>
      {/* Background Image - fixo atrás de tudo */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          backgroundImage: 'url(/fundo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3
        }}
      />

      {/* Gradient overlay */}
      <div className="fixed inset-0 -z-40 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50" />

      {/* Decorative circles */}
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl animate-bounce-gentle"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-pink-200/10 rounded-full blur-3xl animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
      </div>
    </>
  );
}
