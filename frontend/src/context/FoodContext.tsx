import React, { createContext, useContext, ReactNode } from 'react';

interface FoodContextType {
  requests: number;
  listings: number;
  stats: { mealsRescued: number; co2Diverted: number };
}

const FoodContext = createContext<FoodContextType>({
  requests: 0,
  listings: 0,
  stats: { mealsRescued: 0, co2Diverted: 0 },
});

export const useFood = () => useContext(FoodContext);

export const FoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: FoodContextType = {
    requests: 3,
    listings: 12,
    stats: { mealsRescued: 1420, co2Diverted: 2125 },
  };

  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
};

export default FoodContext;
