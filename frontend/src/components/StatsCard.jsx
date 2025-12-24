import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ stat }) => {
    const isUp = stat.trend === 'up';
    const isDown = stat.trend === 'down';

    return (
        <div className="bg-dark-panel p-4 rounded border border-dark-border hover:border-white/20 transition-all duration-200 group">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-semibold text-muted-text uppercase tracking-wide">{stat.label}</p>
                <div className={`p-1 rounded ${isUp ? 'text-neon-green bg-neon-green/10' :
                    isDown ? 'text-coral-red bg-coral-red/10' :
                        'text-muted-text bg-white/5'
                    }`}>
                    {isUp && <TrendingUp className="w-3 h-3" />}
                    {isDown && <TrendingDown className="w-3 h-3" />}
                    {!isUp && !isDown && <Minus className="w-3 h-3" />}
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{stat.value}</h3>
                <span className="text-[10px] text-muted-text font-mono uppercase tracking-wide border-l border-dark-border pl-2">
                    {stat.change}
                </span>
            </div>

            {/* Subtle progress indicator line at bottom */}
            <div className={`mt-3 w-full h-[2px] rounded-full overflow-hidden bg-dark-bg`}>
                <div
                    className={`h-full transition-all duration-1000 ${isUp ? 'bg-neon-green' : isDown ? 'bg-coral-red' : 'bg-muted-text'}`}
                    style={{ width: '100%', opacity: 0.5, transform: 'scaleX(0)', animation: 'slideIn 1s forwards' }}
                />
            </div>
            <style>{`
                @keyframes slideIn {
                    to { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
};

export default StatsCard;
