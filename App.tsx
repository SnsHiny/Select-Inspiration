
import React, { useState, useCallback, useEffect } from 'react';
import { DecisionOption, AIRecommendation, AppMode } from './types';
import { getAIRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RANDOM);
  const [options, setOptions] = useState<DecisionOption[]>([
    { id: '1', text: '火锅' },
    { id: '2', text: '日料' }
  ]);
  const [newOption, setNewOption] = useState('');
  const [context, setContext] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (newOption.trim() && options.length < 10) {
      setOptions([...options, { id: Date.now().toString(), text: newOption.trim() }]);
      setNewOption('');
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(o => o.id !== id));
    }
  };

  const handleRandomRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setResult(null);
    setAiResult(null);
    
    // 模拟滚动动画效果
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * options.length);
      setResult(options[randomIndex].text);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 50);
  };

  const handleAIAnalyze = async () => {
    if (options.length < 2) return;
    setLoading(true);
    setError(null);
    setAiResult(null);
    setResult(null);

    try {
      const rec = await getAIRecommendation(context, options.map(o => o.text));
      setAiResult(rec);
    } catch (err: any) {
      setError(err.message || '获取 AI 建议失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pb-24 md:p-8 max-w-md mx-auto">
      {/* Header */}
      <header className="w-full text-center mb-8 mt-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          智选灵感
        </h1>
        <p className="text-slate-500 text-sm mt-2">解决你的每一个小纠结</p>
      </header>

      {/* Mode Switcher */}
      <div className="flex bg-slate-200 p-1 rounded-xl mb-8 w-full">
        <button
          onClick={() => setMode(AppMode.RANDOM)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === AppMode.RANDOM ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'
          }`}
        >
          🎲 随机碰运气
        </button>
        <button
          onClick={() => setMode(AppMode.AI_EXPERT)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === AppMode.AI_EXPERT ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'
          }`}
        >
          ✨ AI 帮我挑
        </button>
      </div>

      {/* Input Section */}
      <div className="w-full glass-morphism rounded-3xl p-6 shadow-xl mb-6">
        <h2 className="font-semibold mb-4 text-slate-800 flex items-center">
          <span className="mr-2">📝</span> 我的选项 (最多10个)
        </h2>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOption()}
            placeholder="输入新选项..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
          <button
            onClick={addOption}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all text-sm font-bold"
          >
            添加
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border border-indigo-100 animate-in fade-in zoom-in duration-300"
            >
              {opt.text}
              <button
                onClick={() => removeOption(opt.id)}
                className="text-indigo-300 hover:text-indigo-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {mode === AppMode.AI_EXPERT && (
          <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
            <h2 className="font-semibold mb-2 text-slate-800 flex items-center">
              <span className="mr-2">💡</span> 补充背景
            </h2>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="例如：我最近在减肥、外面在下雨、我只有50块钱..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm h-24 resize-none"
            />
          </div>
        )}
      </div>

      {/* Result Display */}
      {(result || aiResult || loading) && (
        <div className="w-full mb-8 animate-in zoom-in duration-500">
          {loading ? (
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">AI 正在深度思考中...</p>
            </div>
          ) : result ? (
            <div className="text-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg text-white">
              <p className="text-indigo-100 text-sm mb-2 font-semibold">最终决定是</p>
              <h3 className="text-4xl font-bold mb-2">{result}</h3>
              <p className="text-xs opacity-75">既然选了，就别后悔啦！</p>
            </div>
          ) : aiResult ? (
            <div className="p-6 bg-white rounded-3xl shadow-lg border border-indigo-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-2 rounded-lg text-xl">🏆</div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">最佳推荐</p>
                  <h3 className="text-2xl font-bold text-slate-800">{aiResult.choice}</h3>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 bg-slate-50 p-4 rounded-xl italic">
                “{aiResult.reason}”
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-600 mb-2">✅ 优点</h4>
                  <ul className="text-xs text-slate-500 space-y-1">
                    {aiResult.pros.map((p, i) => <li key={i}>• {p}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-600 mb-2">⚠️ 注意</h4>
                  <ul className="text-xs text-slate-500 space-y-1">
                    {aiResult.cons.map((c, i) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {error && (
        <div className="w-full p-4 mb-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
          {error}
        </div>
      )}

      {/* Action Button */}
      <div className="fixed bottom-8 left-0 right-0 px-4 max-w-md mx-auto">
        <button
          onClick={mode === AppMode.RANDOM ? handleRandomRoll : handleAIAnalyze}
          disabled={loading || isRolling || options.length < 2}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
            loading || isRolling || options.length < 2
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'
          }`}
        >
          {isRolling ? '正在抽取...' : loading ? '思考中...' : mode === AppMode.RANDOM ? '开始随机抽取' : '获取专家建议'}
        </button>
      </div>
    </div>
  );
};

export default App;
