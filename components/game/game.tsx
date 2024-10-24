'use client'
import { useState, useEffect, useRef } from 'react';

const SlotMachine: React.FC = () => {
    const [linesValue, setLinesValue] = useState<number>(1);
    const [betValue, setBetValue] = useState<number>(10);
    const [winValue, setWinValue] = useState<number>(0);
    const [balance, setBalance] = useState<number>(10000);
    const maxBalance = 1000000;
    const minBalance = 0;
    const maxBet = 500;

    const slotRefs = useRef<(HTMLDivElement | null)[]>([]); // Обновляем для работы с массивом отдельных элементов

    const slotImagesDesktop = [
        'images/1.png', 'images/2.png', 'images/3.png', 'images/4.png',
        'images/5.png', 'images/6.png', 'images/7.png', 'images/8.png', 'images/9.png'
    ];

    const slotImagesMobile = [
        'images/1-small.png', 'images/2-small.png', 'images/3-small.png',
        'images/4-small.png', 'images/5-small.png', 'images/6-small.png',
        'images/7-small.png', 'images/8-small.png', 'images/9-small.png'
    ];

    const winningLines = [
        [1, 4, 7, 10, 13],
        [2, 5, 8, 11, 14],
        [3, 6, 9, 12, 15]
    ];

    const figureCoefficients: { [key: string]: number } = {
        '1.png': 2, '2.png': 1.5, '3.png': 1.5, '4.png': 1.5,
        '5.png': 3, '6.png': 5, '7.png': 1.5, '8.png': 1.5, '9.png': 4,
        '1-small.png': 2, '2-small.png': 1.5, '3-small.png': 1.5, '4-small.png': 1.5,
        '5-small.png': 3, '6-small.png': 5, '7-small.png': 1.5, '8-small.png': 1.5, '9-small.png': 4
    };

    // Функция для уменьшения значения
    const decreaseValue = (setter: React.Dispatch<React.SetStateAction<number>>, minValue: number, step: number) => {
        setter(prev => (prev - step >= minValue ? prev - step : prev));
    };

    // Функция для увеличения значения
    const increaseValue = (setter: React.Dispatch<React.SetStateAction<number>>, maxValue: number, step: number) => {
        setter(prev => (prev + step <= maxValue ? prev + step : prev));
    };

    // Функция для получения случайного изображения
    const getRandomImage = () => {
        const isMobile = window.innerWidth <= 768;
        const slotImages = isMobile ? slotImagesMobile : slotImagesDesktop;
        const randomIndex = Math.floor(Math.random() * slotImages.length);
        return slotImages[randomIndex];
    };

    // Обновляем слот с новым изображением
    const updateSlotImage = (slotIndex: number, image: string) => {
        const slot = slotRefs.current[slotIndex];
        if (slot) {
            slot.style.backgroundImage = `url(${image})`;
            slot.style.backgroundSize = 'cover';
        }
    };

    // Очищаем выделенные линии
    const clearHighlightedLines = () => {
        slotRefs.current.forEach(slot => {
            if (slot) {
                slot.style.borderColor = ''; // Убедитесь, что слот существует
            }
        });
    };
    
    

    const calculateWin = (result: string[], bet: number, selectedLines: number) => {
        let totalWinnings = 0;
        const linesToCheck = winningLines.slice(0, selectedLines);

        linesToCheck.forEach(line => {
            const firstFigure = result[line[0] - 1];
            const matchingSymbols = line.filter(index => result[index - 1] === firstFigure).length;

            if (matchingSymbols >= 3) {
                const coefficient = figureCoefficients[firstFigure.split('/').pop() as string];
                totalWinnings += bet * selectedLines * coefficient;
                highlightWinningLine(line);
            }
        });

        return totalWinnings;
    };

    const highlightWinningLine = (line: number[]) => {
        line.forEach(slotIndex => {
            const slot = slotRefs.current[slotIndex - 1];
            if (slot) slot.style.borderColor = 'yellow';
        });
    };

    // Основная функция для запуска спиннинга
    const spinSlots = () => {
        clearHighlightedLines();
        let currentBet = betValue;
    
        if (linesValue === 3) {
            currentBet *= 3;
        }
    
        if (balance >= currentBet) {
            setBalance(prevBalance => prevBalance - currentBet);
            let result: string[] = [];
    
            for (let col = 0; col < 5; col++) {  // Изменено на 0 для корректной индексации
                let columnResult: string[] = [];
    
                for (let row = 0; row < 3; row++) {  // Изменено на 0 для корректной индексации
                    const slotId = col * 3 + row;  // Изменено на col * 3 + row для корректной работы индексов
                    const randomImage = getRandomImage();
                    updateSlotImage(slotId, randomImage);
                    columnResult.push(randomImage);
                }
    
                result = [...result, ...columnResult];
    
                if (col === 4) {  // Проверка на последний столбец
                    const winnings = calculateWin(result, currentBet, linesValue);
                    if (winnings > 0) {
                        setBalance(prevBalance => prevBalance + winnings);
                    }
                    setWinValue(winnings);
                }
            }
        } else {
            alert('Not enough funds for a bet!');
        }
    };
    

    // Используем refs для слотов
    const renderSlots = () => {
        const slots = [];
        for (let col = 1; col <= 5; col++) {
            const column = [];
            for (let row = 1; row <= 3; row++) {
                const slotId = (col - 1) * 3 + row;
                column.push(
                    <div
                        key={slotId}
                        ref={(el) => {
                            if (el) slotRefs.current[slotId - 1] = el;
                        }}
                        className="slot-item"
                        id={`slot-${slotId}`}
                    />
                );
            }
            slots.push(
                <div className="slot-column" key={col}>
                    {column}
                </div>
            );
        }
        return slots;
    };

    return (
        <div className="slot-machine-container">
            <div className="top-bar">
                <div className="player-info">
                    <img src="/images/avatar.png" alt="Avatar" className="player-avatar" />
                    <span className="player-name">Foxie</span>
                    <span className="player-balance">{balance}</span>
                </div>
                <div className="balance-bar-container">
                    <span className="balance-point">Start</span>
                    
                    <div className="balance-bar" id="balance-bar" />
                </div>
            </div>

            <div className="slot-machine-content">
                {renderSlots()}
            </div>

            <div className="control-panel">
                <div className="lines">
                    <label htmlFor="lines">Lines</label>
                    <div className="input-group">
                        <button onClick={() => decreaseValue(setLinesValue, 1, 1)}>-</button>
                        <span>{linesValue}</span>
                        <button onClick={() => increaseValue(setLinesValue, 3, 1)}>+</button>
                    </div>
                </div>

                <div className="bet">
                    <label htmlFor="bet">Bet</label>
                    <div className="input-group">
                        <button onClick={() => decreaseValue(setBetValue, 10, 10)}>-</button>
                        <span>{betValue}</span>
                        <button onClick={() => increaseValue(setBetValue, 500, 10)}>+</button>
                    </div>
                </div>

                <div className="win">
                    <label htmlFor="win">Win</label>
                    <span className="player-balance">{winValue}</span>
                </div>

                <div className="buttons">
                    <button onClick={() => setBetValue(maxBet)}>MaxBet</button>
                    <button onClick={spinSlots}>Spin</button>
                </div>
            </div>
        </div>
    );
};

export default SlotMachine;
