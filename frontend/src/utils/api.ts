// API Utility Functions for Professor Stock Trading

const API_BASE = '/api';

interface BuyRequest {
  quantity: number;
}

interface SellRequest {
  quantity: number;
}

interface TransactionResponse {
  success: boolean;
  message: string;
  data?: {
    transaction: {
      id: string;
      type: 'buy' | 'sell';
      quantity: number;
      pricePerShare: number;
      totalAmount: number;
      timestamp: string;
    };
    stock: {
      professorId: string;
      oldPrice: string;
      newPrice: string;
      percentChange: string;
      marketCap: string;
    };
    user: {
      newBalance: string;
      portfolioValue: string;
      holdings?: {
        shares: number;
        averageBuyPrice: number;
      };
      gainLoss?: string;
    };
  };
}

// Get authentication token from localStorage
const getToken = (): string | null => localStorage.getItem('token');

// Get all stocks
export const getStocks = async (
  page = 1,
  limit = 50,
  sort = '-currentPrice'
): Promise<any> => {
  const response = await fetch(`${API_BASE}/stocks?page=${page}&limit=${limit}&sort=${sort}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stocks');
  }

  return response.json();
};

// Get trending stocks
export const getTrendingStocks = async (metric = 'volume24h', limit = 20): Promise<any> => {
  const response = await fetch(`${API_BASE}/stocks/trending?metric=${metric}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trending stocks');
  }

  return response.json();
};

// Get stock by professor ID
export const getStock = async (professorId: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/stocks/${professorId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Stock not found');
  }

  return response.json();
};

// Get price history for a stock
export const getStockHistory = async (
  professorId: string,
  days = 30,
  limit = 500
): Promise<any> => {
  const response = await fetch(
    `${API_BASE}/stocks/${professorId}/history?days=${days}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stock history');
  }

  return response.json();
};

// Buy stocks
export const buyStocks = async (
  professorId: string,
  quantity: number
): Promise<TransactionResponse> => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/stocks/${professorId}/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Purchase failed');
  }

  return response.json();
};

// Sell stocks
export const sellStocks = async (
  professorId: string,
  quantity: number
): Promise<TransactionResponse> => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/stocks/${professorId}/sell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sale failed');
  }

  return response.json();
};

// Get user portfolio
export const getUserPortfolio = async (): Promise<any> => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/users/portfolio`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }

  return response.json();
};

// Get transaction history
export const getTransactionHistory = async (
  page = 1,
  limit = 50,
  type?: 'buy' | 'sell'
): Promise<any> => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  let url = `${API_BASE}/users/transactions?page=${page}&limit=${limit}`;
  if (type) {
    url += `&type=${type}`;
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json();
};

// Get all professors
export const getProfessors = async (department?: string): Promise<any> => {
  let url = `${API_BASE}/professors`;
  if (department) {
    url += `?department=${department}`;
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch professors');
  }

  return response.json();
};

// Get professor by ID
export const getProfessor = async (professorId: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/professors/${professorId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Professor not found');
  }

  return response.json();
};

// Search professors
export const searchProfessors = async (query: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/professors/search/${query}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
};
