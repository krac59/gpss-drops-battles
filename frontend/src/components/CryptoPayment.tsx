import React, { useState } from 'react';

interface CryptoPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess?: (amount: number, currency: string, txHash: string) => void;
}

interface Blockchain {
  id: string;
  name: string;
  icon: string;
  nativeToken: string;
  minAmount: number;
  confirmations: number;
  explorerUrl: string;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ isOpen, onClose, userId, onSuccess }) => {
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [txHash, setTxHash] = useState('');

  const blockchains: Blockchain[] = [
    { id: 'ton', name: 'TON', icon: '💎', nativeToken: 'TON', minAmount: 1, confirmations: 30, explorerUrl: 'https://tonscan.org' },
    { id: 'not', name: 'NOT', icon: '📱', nativeToken: 'NOT', minAmount: 1000, confirmations: 30, explorerUrl: 'https://tonscan.org' },
    { id: 'usdt', name: 'USDT (TON)', icon: '💰', nativeToken: 'USDT', minAmount: 10, confirmations: 30, explorerUrl: 'https://tonscan.org' },
  ];

  const currentBlockchain = blockchains.find(b => b.id === selectedBlockchain);

  const generateWalletAddress = (blockchainId: string): string => {
    const wallets: Record<string, string> = {
      ton: 'EQD84uoS1fYwqBxDF9f3kcXTgN4HjK5q5q5q5q5q5q5q5q5q5q5q5q5q',
      not: 'EQD84uoS1fYwqBxDF9f3kcXTgN4HjK5q5q5q5q5q5q5q5q5q5q5q5q5q',
      usdt: 'EQD84uoS1fYwqBxDF9f3kcXTgN4HjK5q5q5q5q5q5q5q5q5q5q5q5q5q',
    };
    return wallets[blockchainId] || '';
  };

  const handleSubmit = () => {
    const mockTxHash = `${selectedBlockchain}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setTxHash(mockTxHash);
    setStep('success');
    if (onSuccess) onSuccess(amount, currentBlockchain?.nativeToken || 'CRYPTO', mockTxHash);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Адрес скопирован!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">💎 Оплата криптовалютой</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {step === 'select' && (
          <>
            <label className="block text-sm text-gray-400 mb-2">Выберите блокчейн</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {blockchains.map(bc => (
                <button
                  key={bc.id}
                  onClick={() => { setSelectedBlockchain(bc.id); setStep('payment'); }}
                  className="p-3 bg-gray-700 rounded-xl text-center hover:bg-gray-600"
                >
                  <span className="text-2xl">{bc.icon}</span>
                  <div className="font-bold text-sm">{bc.name}</div>
                  <div className="text-xs text-gray-400">min {bc.minAmount} {bc.nativeToken}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'payment' && currentBlockchain && (
          <>
            <div className="mb-4 text-center">
              <span className="text-4xl">{currentBlockchain.icon}</span>
              <p className="font-bold">{currentBlockchain.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Сумма ({currentBlockchain.nativeToken})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={currentBlockchain.minAmount}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-xl"
              />
              <p className="text-xs text-gray-500 mt-1">Мин. {currentBlockchain.minAmount} {currentBlockchain.nativeToken}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Адрес кошелька получателя</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generateWalletAddress(selectedBlockchain)}
                  readOnly
                  className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-xs font-mono"
                />
                <button onClick={() => copyToClipboard(generateWalletAddress(selectedBlockchain))} className="bg-gray-600 px-3 rounded-lg">📋</button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={amount < currentBlockchain.minAmount}
              className="w-full bg-purple-600 py-3 rounded-full font-bold disabled:opacity-50"
            >
              Оплатить {amount} {currentBlockchain.nativeToken}
            </button>

            <button onClick={() => setStep('select')} className="w-full mt-2 text-gray-400 text-sm py-2">
              ← Назад к выбору блокчейна
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-bold">Платёж создан!</p>
            <p className="text-sm text-gray-400 mt-2 break-all">Hash: {txHash}</p>
            <button onClick={onClose} className="mt-4 bg-purple-600 px-4 py-2 rounded-lg">Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPayment;