import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SearchRequest } from '@/types';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface SearchFormProps {
  onSearch: (request: SearchRequest) => void;
  isLoading: boolean;
}

type SortBy = 'relevance' | 'price_asc' | 'price_desc' | 'rating';
type SelectionStrategy = 'first' | 'cheapest' | 'highest_rated' | 'best_value';

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [selectionStrategy, setSelectionStrategy] = useState<SelectionStrategy>('first');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSearch({
      query: query.trim(),
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      limit: 20,
      selectionStrategy,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Search className="h-4 w-4 text-primary" />
            </div>
            Search Products
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Search Query
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="query"
                type="text"
                placeholder="e.g. pliers, hammer, saw..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                className="pl-9"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-2 border-t"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Advanced Filters
            </span>
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showAdvanced && (
            <div className="space-y-4 pb-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Min Price</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="$0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Max Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="$1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sortBy" className="text-xs text-muted-foreground">Sort Results By</Label>
                <Select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  disabled={isLoading}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="selectionStrategy" className="text-xs text-muted-foreground">Auto-Select Strategy</Label>
                <Select
                  id="selectionStrategy"
                  value={selectionStrategy}
                  onChange={(e) => setSelectionStrategy(e.target.value as SelectionStrategy)}
                  disabled={isLoading}
                >
                  <option value="first">First Result</option>
                  <option value="cheapest">Cheapest</option>
                  <option value="highest_rated">Highest Rated</option>
                  <option value="best_value">Best Value (Rating/Price)</option>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !query.trim()} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
