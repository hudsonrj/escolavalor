import { School, Users, Award, Brain, Heart, Target, Sparkles, Zap } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  gradient: string;
  emoji: string;
  delay?: string;
}

function StatCard({ icon: Icon, value, label, gradient, emoji, delay = '0s' }: StatCardProps) {
  return (
    <div
      className="group relative animate-slide-up"
      style={{ animationDelay: delay }}
    >
      {/* Animated glow on hover */}
      <div className={`absolute -inset-1 bg-gradient-to-br ${gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>

      {/* Main card */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/50">
        {/* Icon with gradient background */}
        <div className={`mb-6 inline-flex bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          <Icon className="h-8 w-8 text-white" />
        </div>

        {/* Value with emoji */}
        <div className="flex items-baseline gap-3 mb-3">
          <div className="text-5xl font-black font-display text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-br group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text transition-all duration-300">
            {value}
          </div>
          <span className="text-3xl animate-bounce-gentle">{emoji}</span>
        </div>

        {/* Label */}
        <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">
          {label}
        </div>

        {/* Decorative element */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  emoji: string;
  highlightColor: string;
  delay?: string;
}

function FeatureCard({ icon: Icon, title, description, gradient, emoji, highlightColor, delay = '0s' }: FeatureCardProps) {
  return (
    <div
      className="group relative animate-slide-up"
      style={{ animationDelay: delay }}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-br ${gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-500`}></div>

      {/* Card */}
      <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 overflow-hidden transform hover:scale-105 hover:-translate-y-2">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>

        <div className="relative z-10">
          {/* Icon */}
          <div className={`mb-6 inline-flex bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
            <Icon className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text transition-all duration-300">
            {title} <span className="text-2xl">{emoji}</span>
          </h3>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed font-medium">
            {description.split('**').map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className={`font-black ${highlightColor}`}>
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  );
}

export function StatsInfographic() {
  return (
    <div className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg border-2 border-blue-100 mb-6 animate-slide-up">
            <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
            <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
            <span className="text-sm font-bold text-gray-800">Números que Impressionam</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black font-display mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-gray-900">Dados Confiáveis para</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Decisões Inteligentes
            </span> 📊
          </h2>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-medium animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Nossa plataforma usa <span className="font-black text-blue-600">inteligência artificial</span> para
            analisar dados oficiais
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard
            icon={School}
            value="1,427"
            label="Escolas Analisadas"
            gradient="from-blue-500 to-indigo-600"
            emoji="🏫"
            delay="0s"
          />
          <StatCard
            icon={Brain}
            value="100%"
            label="Foco em Inclusão"
            gradient="from-purple-500 to-fuchsia-600"
            emoji="💜"
            delay="0.1s"
          />
          <StatCard
            icon={Users}
            value="15K+"
            label="Famílias Felizes"
            gradient="from-green-500 to-emerald-600"
            emoji="👨‍👩‍👧‍👦"
            delay="0.2s"
          />
          <StatCard
            icon={Award}
            value="98%"
            label="Satisfação"
            gradient="from-amber-500 to-orange-600"
            emoji="⭐"
            delay="0.3s"
          />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Target}
            title="IA Avançada"
            description="Algoritmos de **machine learning** analisam compatibilidade entre perfil do aluno e escola"
            gradient="from-blue-500 to-indigo-600"
            emoji="🤖"
            highlightColor="text-blue-600"
            delay="0s"
          />

          <FeatureCard
            icon={Brain}
            title="Psicologia"
            description="Critérios baseados em **pesquisas científicas** de psicologia educacional"
            gradient="from-purple-500 to-fuchsia-600"
            emoji="🧠"
            highlightColor="text-purple-600"
            delay="0.1s"
          />

          <FeatureCard
            icon={Heart}
            title="Inclusão"
            description="Avaliação **especializada** para TEA, TDAH, dislexia e superdotação"
            gradient="from-pink-500 to-rose-600"
            emoji="❤️"
            highlightColor="text-pink-600"
            delay="0.2s"
          />
        </div>
      </div>
    </div>
  );
}
