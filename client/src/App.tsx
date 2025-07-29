
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleIncrement = async () => {
    setIsLoading(true);
    try {
      const result = await trpc.incrementCounter.mutate({ amount: 1 });
      setCounter(result);
    } catch (error) {
      console.error('Failed to increment counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = async () => {
    setIsLoading(true);
    try {
      const result = await trpc.decrementCounter.mutate({ amount: 1 });
      setCounter(result);
    } catch (error) {
      console.error('Failed to decrement counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const result = await trpc.resetCounter.mutate({ value: 0 });
      setCounter(result);
    } catch (error) {
      console.error('Failed to reset counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!counter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading counter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Counter Application
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {counter.value}
            </div>
            <Badge variant="secondary" className="text-sm">
              Current Count
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleIncrement}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                size="lg"
              >
                {isLoading ? '...' : '+1'}
              </Button>
              
              <Button
                onClick={handleDecrement}
                disabled={isLoading}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50 font-semibold py-3"
                size="lg"
              >
                {isLoading ? '...' : '-1'}
              </Button>
            </div>
            
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="secondary"
              className="w-full font-semibold py-3"
              size="lg"
            >
              {isLoading ? 'Resetting...' : 'Reset to 0'}
            </Button>
          </div>

          {/* Counter Info */}
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Counter ID: {counter.id}</p>
            <p>Last updated: {counter.updated_at.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
